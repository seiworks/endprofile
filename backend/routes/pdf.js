const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const User = require('../models/User');

const router = express.Router();

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

router.post('/document', async (req, res) => {
    const { type, title, content } = req.body || {};

    if (!type || !title || !content) {
        return res.status(400).json({ message: '缺少必要欄位' });
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(title)}_${timestamp}.pdf"`
    );

    const doc = new PDFDocument({
        margin: 50,
    });

    const fontCandidates = [
        process.env.PDF_FONT_PATH,
        '/System/Library/Fonts/PingFang.ttc',
        '/System/Library/Fonts/STHeiti Light.ttc',
        '/System/Library/Fonts/STHeiti Medium.ttc',
    ].filter(Boolean);

    let fontSet = false;
    for (const fontPath of fontCandidates) {
        try {
            if (fs.existsSync(fontPath)) {
                doc.font(fontPath);
                fontSet = true;
                break;
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (!fontSet) {
        doc.font('Helvetica');
    }

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

    if (type === 'COHABITATION' || type === 'JOINT_PURCHASE') {
        doc.addPage();
        doc.text('甲方簽名／身分證字號：______________________________', {
            align: 'left',
        });
        doc.moveDown(1);
        doc.text('乙方簽名／身分證字號：______________________________', {
            align: 'left',
        });
    } else {
        doc.text('簽名／身分證字號：______________________________', {
            align: 'left',
        });
    }

    doc.moveDown(1);
    doc.text('中華民國          年          月          日', {
        align: 'right',
    });

    doc.end();
});

module.exports = router;
