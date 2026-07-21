import axios from 'axios';
import { encryptPayload } from './vault';

export async function migrateLegacyDocuments() {
    const response = await axios.get('/api/documents');
    const documents = Array.isArray(response.data) ? response.data : [];
    for (const document of documents) {
        if (document.encryptedPayload) continue;
        const detailResponse = await axios.get(`/api/documents/${document._id}`);
        const detail = detailResponse.data;
        if (!detail || detail.encryptedPayload) continue;
        const encryptedPayload = await encryptPayload({
            structuredData: detail.structuredData || {},
            draftText: detail.draftText || '',
        });
        await axios.patch(`/api/documents/${document._id}`, { encryptedPayload });
    }
}
