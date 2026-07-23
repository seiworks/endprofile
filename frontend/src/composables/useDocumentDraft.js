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
    let idleSaveTimer = null;
    let lastSavedSnapshot = '';
    let loadComplete = false;
    let loadPromise = null;
    let savePromise = null;

    const lastSavedText = computed(() => formatSavedAt(lastSavedAt.value));

    const currentSnapshot = () => JSON.stringify({
        structuredData: cloneForm(form),
        draftText: previewText.value,
    });

    const isDirty = () => loadComplete && currentSnapshot() !== lastSavedSnapshot;

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
        if (!isDirty()) return true;
        if (savePromise) return savePromise;

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
                error.value = '儲存失敗，已暫停切換頁面，請稍後再試。';
                return false;
            } finally {
                saving.value = false;
                savePromise = null;
            }
        })();
        return savePromise;
    }

    async function loadDraft() {
        try {
            const response = await axios.get('/api/documents');
            const docs = Array.isArray(response.data) ? response.data : [];
            const doc = docs.find((item) => item.type === type);
            if (!doc) {
                return;
            }
            const detailResponse = await axios.get(`/api/documents/${doc._id}`);
            const detail = detailResponse.data || doc;
            documentId.value = detail._id;
            if (detail.updatedAt) {
                lastSavedAt.value = detail.updatedAt;
            }
            if (detail.encryptedPayload) {
                const decrypted = await decryptPayload(detail.encryptedPayload);
                applyStructuredData(form, decrypted.structuredData);
            } else {
                applyStructuredData(form, detail.structuredData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            lastSavedSnapshot = currentSnapshot();
            loadComplete = true;
            if (afterLoad) {
                afterLoad();
            }
        }
    }

    async function onDownload() {
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
        }
    });

    return {
        documentId,
        downloading,
        error,
        lastSavedAt,
        lastSavedText,
        loadDraft,
        onDownload,
        onSaveDraft,
        saving,
        showFloatingSave,
    };
}
