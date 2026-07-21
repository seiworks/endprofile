const SIGNATURES = {
    WILL: ['立遺囑人簽名／身分證字號：______________________________'],
    COHABITATION: ['甲方簽名／身分證字號：______________________________', '乙方簽名／身分證字號：______________________________'],
    GUARDIANSHIP: ['本人簽名／身分證字號：______________________________', '受任監護人簽名／身分證字號：______________________________'],
    LIFE_AUTHORIZATION: ['授權人簽名／身分證字號：______________________________', '被授權人簽名／身分證字號：______________________________'],
    JOINT_PURCHASE: ['甲方簽名／身分證字號：______________________________', '乙方簽名／身分證字號：______________________________'],
};

function wrapLine(text, font, size, maxWidth) {
    if (!text) return [''];
    const lines = [];
    let current = '';
    for (const character of text) {
        const candidate = current + character;
        if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
            lines.push(current);
            current = character;
        } else {
            current = candidate;
        }
    }
    lines.push(current);
    return lines;
}

function safeFilename(value) {
    return String(value || 'document').replace(/[\\/:*?"<>|]/g, '_');
}

export async function downloadDocumentPdf({ type, title, content }) {
    const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([
        import('pdf-lib'),
        import('@pdf-lib/fontkit'),
    ]);
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const fontResponse = await fetch('/fonts/NotoSansTC-Regular.otf', { cache: 'force-cache' });
    if (!fontResponse.ok) throw new Error('無法載入 PDF 中文字型');
    const font = await pdf.embedFont(await fontResponse.arrayBuffer(), { subset: false });
    const pageSize = [595.28, 841.89];
    const margin = 50;
    const bodySize = 11;
    const lineHeight = 18;
    let page = pdf.addPage(pageSize);
    let y = page.getHeight() - margin;

    const addPage = () => {
        page = pdf.addPage(pageSize);
        y = page.getHeight() - margin;
    };
    const drawLine = (line, options = {}) => {
        const size = options.size || bodySize;
        if (y < margin + lineHeight) addPage();
        page.drawText(line, {
            x: options.x || margin,
            y,
            size,
            font,
            color: rgb(0.12, 0.12, 0.14),
        });
        y -= options.lineHeight || lineHeight;
    };

    const titleWidth = font.widthOfTextAtSize(title, 18);
    drawLine(title, { size: 18, x: Math.max((page.getWidth() - titleWidth) / 2, margin), lineHeight: 30 });
    y -= 8;
    for (const paragraph of String(content).split('\n')) {
        for (const line of wrapLine(paragraph, font, bodySize, page.getWidth() - margin * 2)) drawLine(line);
        if (!paragraph) y -= 4;
    }

    y -= 24;
    for (const signature of SIGNATURES[type] || ['簽名：______________________________']) {
        drawLine(signature, { lineHeight: 28 });
    }
    y -= 8;
    drawLine('中華民國          年          月          日');

    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFilename(title)}_${new Date().toISOString().slice(0, 10).replaceAll('-', '')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
