const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/will/generate', auth, async (req, res) => {
    const payload = req.body || {};
    return res.json({
        draftText: '這裡會由 AI 依照你的回答產生「遺囑」草稿內容（目前為範例假資料）。',
        structuredData: payload.structuredData || {},
    });
});

router.post('/cohabitation/generate', auth, async (req, res) => {
    const payload = req.body || {};
    return res.json({
        draftText:
            '這裡會由 AI 依照你的回答產生「授權書／同居協議」草稿內容（目前為範例假資料）。',
        structuredData: payload.structuredData || {},
    });
});

router.post('/guardianship/generate', auth, async (req, res) => {
    const payload = req.body || {};
    return res.json({
        draftText:
            '這裡會由 AI 依照你的回答產生「意定監護契約」草稿內容（目前為範例假資料）。',
        structuredData: payload.structuredData || {},
    });
});

module.exports = router;

