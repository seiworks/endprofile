const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendError = require('../utils/httpError');
const { DOCUMENT_TYPES, DOCUMENT_TYPE_VALUES } = require('../constants/documentTypes');

const router = express.Router();

const SIGNATURE_FIELDS = Object.freeze({
    [DOCUMENT_TYPES.WILL]: ['立遺囑人簽名／身分證字號：______________________________'],
    [DOCUMENT_TYPES.COHABITATION]: [
        '甲方簽名／身分證字號：______________________________',
        '乙方簽名／身分證字號：______________________________',
    ],
    [DOCUMENT_TYPES.GUARDIANSHIP]: [
        '本人簽名／身分證字號：______________________________',
        '受任監護人簽名／身分證字號：______________________________',
    ],
    [DOCUMENT_TYPES.LIFE_AUTHORIZATION]: [
        '授權人簽名／身分證字號：______________________________',
        '被授權人簽名／身分證字號：______________________________',
    ],
    [DOCUMENT_TYPES.JOINT_PURCHASE]: [
        '甲方簽名／身分證字號：______________________________',
        '乙方簽名／身分證字號：______________________________',
    ],
});

function formatTimestamp(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function resolvePdfFontPath() {
    const fontCandidates = [
        path.join(__dirname, '..', 'fonts', 'NotoSansTC-Regular.otf'),
        process.env.PDF_FONT_PATH,
        '/System/Library/Fonts/PingFang.ttc',
        '/System/Library/Fonts/STHeiti Light.ttc',
        '/System/Library/Fonts/STHeiti Medium.ttc',
    ].filter(Boolean);

    return fontCandidates.find((fontPath) => {
        try {
            return fs.existsSync(fontPath);
        } catch (err) {
            console.error(err);
            return false;
        }
    });
}

router.post('/document', auth, async (req, res) => {
    const { type, title, content } = req.body || {};

    if (!type || !title || !content) {
        return sendError(res, 400, '缺少必要欄位');
    }

    if (!DOCUMENT_TYPE_VALUES.includes(type)) {
        return sendError(res, 400, '文件類型不正確');
    }

    let userName = '';
    if (req.user && req.user.id) {
        try {
            const user = await User.findById(req.user.id).select('name');
            if (user) {
                userName = user.name;
            }
        } catch (err) {
            console.error(err);
        }
    }

    const timestamp = formatTimestamp(new Date());
    const pdfFontPath = resolvePdfFontPath();

    if (!pdfFontPath) {
        return sendError(res, 500, '找不到可用的 PDF 中文字型');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-PDF-Font', path.basename(pdfFontPath));
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(title)}_${timestamp}.pdf"`
    );

    const doc = new PDFDocument({
        margin: 50,
    });

    doc.registerFont('NotoSansTC', pdfFontPath);
    doc.font('NotoSansTC');

    doc.on('error', (err) => {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).end();
        }
    });

    doc.pipe(res);

    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();

    if (userName) {
        doc.fontSize(12).text(`立文件人：${userName}`, { align: 'left' });
        doc.moveDown();
    }

    doc.fontSize(12).text(content, {
        align: 'left',
    });

    doc.moveDown(2);

    const signatureFields = SIGNATURE_FIELDS[type] || ['簽名／身分證字號：______________________________'];

    if (signatureFields.length > 1) {
        doc.addPage();
    }

    signatureFields.forEach((field, index) => {
        if (index > 0) {
            doc.moveDown(1);
        }
        doc.text(field, {
            align: 'left',
        });
    });

    doc.moveDown(1);
    doc.text('中華民國          年          月          日', {
        align: 'right',
    });

    doc.end();
});

module.exports = router;
