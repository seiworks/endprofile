import axios from 'axios';

export async function downloadDocumentPdf({ type, title, content }) {
    const response = await axios.post(
        '/api/pdf/document',
        { type, title, content },
        { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    let filename = `${title || 'document'}.pdf`;
    const disposition = response.headers && response.headers['content-disposition'];
    if (disposition) {
        const match = /filename="?([^"]+)"?/i.exec(disposition);
        if (match && match[1]) {
            try {
                filename = decodeURIComponent(match[1]);
            } catch {
                filename = match[1];
            }
        }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
