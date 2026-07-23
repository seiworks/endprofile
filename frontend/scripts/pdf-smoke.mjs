import fs from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const pdf = await PDFDocument.create();
pdf.registerFontkit(fontkit);
const fontBytes = await fs.readFile('public/fonts/NotoSansTC-Regular.otf');
const font = await pdf.embedFont(fontBytes, { subset: false });
const page = pdf.addPage([595.28, 841.89]);
page.drawText('共同購屋協議 - 本機 PDF 測試', { x: 50, y: 790, size: 18, font });
page.drawText('甲方：王小明　乙方：林小潔', { x: 50, y: 750, size: 12, font });
page.drawText('本文件由瀏覽器端產生，內容不會傳送至後端。', { x: 50, y: 725, size: 12, font });
await fs.mkdir('../tmp/pdfs', { recursive: true });
await fs.writeFile('../tmp/pdfs/local-storage-smoke.pdf', await pdf.save());
