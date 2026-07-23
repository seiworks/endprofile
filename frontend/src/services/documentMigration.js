import axios from 'axios';
import { decryptPayload } from './vault';

export async function migrateEncryptedDocuments() {
    const response = await axios.get('/api/documents');
    const documents = Array.isArray(response.data) ? response.data : [];
    for (const document of documents) {
        const detailResponse = await axios.get(`/api/documents/${document._id}`);
        const detail = detailResponse.data;
        if (!detail || !detail.encryptedPayload) continue;
        const plaintext = await decryptPayload(detail.encryptedPayload);
        await axios.post(`/api/documents/${document._id}/migrate`, {
            structuredData: plaintext.structuredData || {},
            draftText: plaintext.draftText || '',
        });
    }
}
