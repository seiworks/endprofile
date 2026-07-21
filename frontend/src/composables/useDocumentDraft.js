import { computed, onMounted, onUnmounted, ref } from 'vue';
import axios from 'axios';
import { downloadDocumentPdf } from '../services/pdf';
import { decryptPayload, encryptPayload } from '../services/vault';

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

export function useDocumentDraft({ type, title, form, previewText, afterLoad }) {
    const downloading = ref(false);
    const saving = ref(false);
    const error = ref('');
    const lastSavedAt = ref('');
    const documentId = ref('');
    const showFloatingSave = ref(false);

    const lastSavedText = computed(() => formatSavedAt(lastSavedAt.value));

    const handleScroll = () => {
        if (typeof window === 'undefined') {
            return;
        }
        showFloatingSave.value = window.scrollY > 200;
    };

    async function onSaveDraft() {
        if (saving.value) {
            return;
        }
        saving.value = true;
        error.value = '';
        try {
            const encryptedPayload = await encryptPayload({
                structuredData: cloneForm(form),
                draftText: previewText.value,
            });
            const payload = {
                title,
                encryptedPayload,
                status: 'DRAFT',
            };
            const response = documentId.value
                ? await axios.patch(`/api/documents/${documentId.value}`, payload)
                : await axios.post('/api/documents', {
                    type,
                    ...payload,
                });

            const doc = response && response.data;
            if (doc && doc._id) {
                documentId.value = doc._id;
            }
            if (doc && doc.updatedAt) {
                lastSavedAt.value = doc.updatedAt;
            }
        } catch (e) {
            console.error(e);
            error.value = '儲存失敗，請稍後再試。';
        } finally {
            saving.value = false;
        }
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
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        }
        loadDraft();
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', handleScroll);
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
