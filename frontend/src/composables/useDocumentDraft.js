import { computed, onMounted, onUnmounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import axios from 'axios';
import { downloadDocumentPdf } from '../services/pdf';
import { decryptPayload } from '../services/vault';

function cloneForm(form) {
    return JSON.parse(JSON.stringify(form));
}

function applyStructuredData(form, structuredData) {
    const data = structuredData || {};
    Object.keys(data).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(form, key)) {
            form[key] = data[key];
        }
    });
}

function formatSavedAt(value) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const pad = (n) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

const IDLE_SAVE_MS = 30 * 60 * 1000;
const SAVE_RETRY_MS = 60 * 1000;
const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'input', 'change', 'scroll'];

export function useDocumentDraft({ type, title, form, previewText, afterLoad }) {
    const downloading = ref(false);
    const saving = ref(false);
    const error = ref('');
    const lastSavedAt = ref('');
    const documentId = ref('');
    const showFloatingSave = ref(false);
    // 'loading' | 'ready' | 'load-error' | 'locked'
    const loadStatus = ref('loading');
    let idleSaveTimer = null;
    let lastSavedSnapshot = '';
    let loadPromise = null;
    let savePromise = null;

    const lastSavedText = computed(() => formatSavedAt(lastSavedAt.value));

    const currentSnapshot = () => JSON.stringify({
        structuredData: cloneForm(form),
        draftText: previewText.value,
    });

    const isDirty = () => loadStatus.value === 'ready' && currentSnapshot() !== lastSavedSnapshot;

    const handleBeforeUnload = (event) => {
        if (isDirty()) {
            event.preventDefault();
            event.returnValue = '';
        }
    };

    const clearIdleSaveTimer = () => {
        if (idleSaveTimer) window.clearTimeout(idleSaveTimer);
        idleSaveTimer = null;
    };

    const scheduleIdleSave = (delay = IDLE_SAVE_MS) => {
        if (typeof window === 'undefined') return;
        clearIdleSaveTimer();
        idleSaveTimer = window.setTimeout(async () => {
            idleSaveTimer = null;
            if (!isDirty()) return;
            const saved = await onSaveDraft();
            if (!saved) scheduleIdleSave(SAVE_RETRY_MS);
        }, delay);
    };

    const handleActivity = () => {
        if (typeof window === 'undefined') {
            return;
        }
        showFloatingSave.value = window.scrollY > 200;
        scheduleIdleSave();
    };

    async function onSaveDraft() {
        if (loadPromise) await loadPromise;
        if (loadStatus.value !== 'ready') return false;
        if (!isDirty()) return true;
        if (savePromise) {
            // Wait for in-flight save then re-evaluate — captures changes made during flight
            await savePromise;
            return onSaveDraft();
        }

        savePromise = (async () => {
            saving.value = true;
            error.value = '';
            const payload = {
                title,
                structuredData: cloneForm(form),
                draftText: previewText.value,
                status: 'DRAFT',
            };
            const savedSnapshot = JSON.stringify({
                structuredData: payload.structuredData,
                draftText: payload.draftText,
            });
            try {
                const response = documentId.value
                    ? await axios.patch(`/api/documents/${documentId.value}`, payload)
                    : await axios.post('/api/documents', {
                        type,
                        ...payload,
                    });

                const doc = response && response.data;
                if (doc && doc._id) documentId.value = doc._id;
                if (doc && doc.updatedAt) lastSavedAt.value = doc.updatedAt;
                lastSavedSnapshot = savedSnapshot;
                return true;
            } catch (e) {
                console.error(e);
                if (e.response && e.response.status === 401) {
                    error.value = 'Session 已過期，請重新登入後再儲存。';
                } else if (e.response && e.response.status === 409) {
                    error.value = '文件含有未轉換的舊密文，請重新整理頁面後再儲存。';
                } else {
                    error.value = '儲存失敗，已暫停切換頁面，請稍後再試。';
                }
                return false;
            } finally {
                saving.value = false;
                savePromise = null;
            }
        })();
        return savePromise;
    }

    async function loadDraft() {
        loadStatus.value = 'loading';
        try {
            const response = await axios.get('/api/documents');
            const docs = Array.isArray(response.data) ? response.data : [];
            const doc = docs.find((item) => item.type === type);
            if (!doc) {
                loadStatus.value = 'ready';
                return;
            }
            const detailResponse = await axios.get(`/api/documents/${doc._id}`);
            const detail = detailResponse.data || doc;
            if (detail.updatedAt) {
                lastSavedAt.value = detail.updatedAt;
            }
            if (detail.encryptedPayload) {
                let decrypted;
                try {
                    decrypted = await decryptPayload(detail.encryptedPayload);
                } catch (decryptErr) {
                    console.error(decryptErr);
                    loadStatus.value = 'locked';
                    return;
                }
                // Migrate to plaintext before editing; PATCH rejects documents that still hold ciphertext
                let migrated;
                try {
                    const migrateResponse = await axios.post(`/api/documents/${detail._id}/migrate`, {
                        structuredData: decrypted.structuredData || {},
                        draftText: decrypted.draftText || '',
                    });
                    migrated = migrateResponse.data;
                } catch (migrateErr) {
                    // 409: already migrated elsewhere (e.g. by login), so use the server copy
                    if (!migrateErr.response || migrateErr.response.status !== 409) throw migrateErr;
                    const refreshed = await axios.get(`/api/documents/${detail._id}`);
                    migrated = refreshed.data;
                }
                if (!migrated || migrated.encryptedPayload) throw new Error('Legacy document migration incomplete');
                // Set documentId only after successful decryption and migration
                documentId.value = detail._id;
                if (migrated.updatedAt) lastSavedAt.value = migrated.updatedAt;
                applyStructuredData(form, migrated.structuredData);
            } else {
                documentId.value = detail._id;
                applyStructuredData(form, detail.structuredData);
            }
            loadStatus.value = 'ready';
        } catch (e) {
            console.error(e);
            loadStatus.value = 'load-error';
        } finally {
            lastSavedSnapshot = currentSnapshot();
            if (afterLoad) {
                afterLoad();
            }
        }
    }

    function reloadDraft() {
        documentId.value = '';
        lastSavedAt.value = '';
        error.value = '';
        loadPromise = loadDraft();
        return loadPromise;
    }

    async function onDownload() {
        if (loadStatus.value !== 'ready') {
            error.value = '文件尚未載入完成，無法下載。';
            return;
        }
        downloading.value = true;
        error.value = '';
        try {
            await downloadDocumentPdf({ type, title, content: previewText.value });
        } catch (e) {
            console.error('PDF download failed:', e);
            error.value = '下載 PDF 失敗，請稍後再試。';
        } finally {
            downloading.value = false;
        }
    }

    onMounted(() => {
        if (typeof window !== 'undefined') {
            activityEvents.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
            window.addEventListener('beforeunload', handleBeforeUnload);
            handleActivity();
        }
        loadPromise = loadDraft();
    });

    onBeforeRouteLeave(async (to, from, next) => {
        clearIdleSaveTimer();
        const saved = await onSaveDraft();
        next(saved ? undefined : false);
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            clearIdleSaveTimer();
            activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    });

    return {
        documentId,
        downloading,
        error,
        lastSavedAt,
        lastSavedText,
        loadDraft,
        loadStatus,
        onDownload,
        onSaveDraft,
        reloadDraft,
        saving,
        showFloatingSave,
    };
}
