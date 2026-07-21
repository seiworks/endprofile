const express = require('express');
const auth = require('../middleware/auth');
const { DOCUMENT_TYPE_CONFIG } = require('../constants/documentTypes');
const sendError = require('../utils/httpError');

const router = express.Router();

const DOCUMENT_PROMPTS = {
    will: {
        draftText: '這裡會由 AI 依照你的回答產生「預立遺囑」草稿內容（目前為本地範例假資料）。',
    },
    cohabitation: {
        draftText:
            '這裡會由 AI 依照你的回答產生「授權書／同居協議」草稿內容（目前為本地範例假資料）。',
    },
    guardianship: {
        draftText:
            '這裡會由 AI 依照你的回答產生「意定監護契約」草稿內容（目前為本地範例假資料）。',
    },
    'joint-purchase': {
        draftText:
            '這裡會由 AI 依照你的回答產生「共同購屋協議」草稿內容（目前為本地範例假資料）。',
    },
    'life-authorization': {
        draftText:
            '這裡會由 AI 依照你的回答產生「生活授權」草稿內容（目前為本地範例假資料）。',
    },
};

function generateDraft(documentType, payload) {
    const config = DOCUMENT_TYPE_CONFIG[documentType];
    const prompt = DOCUMENT_PROMPTS[documentType];
    if (!config || !prompt) {
        return null;
    }

    return {
        type: config.type,
        title: config.title,
        draftText: prompt.draftText,
        structuredData: payload.structuredData || {},
    };
}

router.post('/:documentType/generate', auth, async (req, res) => {
    const payload = req.body || {};
    const result = generateDraft(req.params.documentType, payload);

    if (!result) {
        return sendError(res, 404, '不支援的文件類型');
    }

    return res.json(result);
});

module.exports = router;
