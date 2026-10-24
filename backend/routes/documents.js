const express = require('express');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const sendError = require('../utils/httpError');
const {
    DOCUMENT_TYPE_VALUES,
    DOCUMENT_STATUS_VALUES,
    DOCUMENT_STATUSES,
} = require('../constants/documentTypes');

const router = express.Router();

const UPDATE_FIELDS = ['title', 'structuredData', 'draftText', 'status'];
const MAX_TITLE_LENGTH = 200;
const MAX_DRAFT_LENGTH = 2_000_000;
const MAX_STRUCTURED_DATA_BYTES = 4_000_000;

function hasOwn(payload, field) {
    return Object.prototype.hasOwnProperty.call(payload, field);
}

function normalizeStructuredData(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    try {
        if (Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_STRUCTURED_DATA_BYTES) return null;
    } catch {
        return null;
    }
    return value;
}

function normalizeDraftText(value) {
    return typeof value === 'string' && value.length <= MAX_DRAFT_LENGTH ? value : null;
}

router.get('/', auth, async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.user.id })
            .select('-structuredData -draftText -encryptedPayload')
            .sort({ updatedAt: -1 });
        return res.json(docs);
    } catch (err) {
        console.error(err);
    return sendError(res, 500, '取得文件清單失敗');
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) {
      return sendError(res, 404, '找不到文件');
        }
        return res.json(doc);
    } catch (err) {
        if (err.name === 'CastError') return sendError(res, 400, '文件 ID 格式不正確');
        console.error(err);
    return sendError(res, 500, '取得文件失敗');
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const payload = req.body || {};

        if (!payload.type || !DOCUMENT_TYPE_VALUES.includes(payload.type)) {
      return sendError(res, 400, '文件類型不正確');
        }

        if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim() || payload.title.trim().length > MAX_TITLE_LENGTH) {
      return sendError(res, 400, '缺少文件標題');
        }

        if (payload.status && !DOCUMENT_STATUS_VALUES.includes(payload.status)) {
      return sendError(res, 400, '文件狀態不正確');
        }
        const structuredData = normalizeStructuredData(payload.structuredData);
        const draftText = normalizeDraftText(payload.draftText);
        if (!structuredData || draftText === null) return sendError(res, 400, '文件內容格式不正確');

        const doc = await Document.create({
            userId: req.user.id,
            type: payload.type,
            title: payload.title.trim(),
            structuredData,
            draftText,
            encryptedPayload: null,
            status: payload.status || DOCUMENT_STATUSES.DRAFT,
        });
        return res.status(201).json(doc);
    } catch (err) {
        console.error(err);
    return sendError(res, 500, '建立文件失敗');
    }
});

router.post('/:id/migrate', auth, async (req, res) => {
    try {
        const structuredData = normalizeStructuredData(req.body && req.body.structuredData);
        const draftText = normalizeDraftText(req.body && req.body.draftText);
        if (!structuredData || draftText === null) return sendError(res, 400, '文件內容格式不正確');

        const existing = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!existing) return sendError(res, 404, '找不到文件');
        if (!existing.encryptedPayload) return sendError(res, 409, '文件不需要進行密文轉換');

        const doc = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id, encryptedPayload: { $ne: null } },
            {
                $set: { structuredData, draftText, updatedAt: existing.updatedAt },
                $unset: { encryptedPayload: 1 },
                $inc: { version: 1 },
            },
            { new: true, timestamps: false }
        );
        if (!doc) return sendError(res, 409, '文件已完成密文轉換');
        return res.json(doc);
    } catch (err) {
        if (err.name === 'CastError') return sendError(res, 400, '文件 ID 格式不正確');
        console.error(err);
        return sendError(res, 500, '轉換舊文件失敗');
    }
});

router.patch('/:id', auth, async (req, res) => {
    try {
        const payload = req.body || {};
        const update = {};

        for (const field of UPDATE_FIELDS) {
            if (hasOwn(payload, field)) {
                update[field] = payload[field];
            }
        }

        if (hasOwn(update, 'title')) {
            if (!update.title || typeof update.title !== 'string' || !update.title.trim() || update.title.trim().length > MAX_TITLE_LENGTH) {
        return sendError(res, 400, '文件標題不正確');
            }
            update.title = update.title.trim();
        }

        if (hasOwn(update, 'status') && !DOCUMENT_STATUS_VALUES.includes(update.status)) {
      return sendError(res, 400, '文件狀態不正確');
        }
        if (hasOwn(update, 'structuredData')) {
            update.structuredData = normalizeStructuredData(update.structuredData);
            if (!update.structuredData) return sendError(res, 400, '表單資料格式不正確');
        }
        if (hasOwn(update, 'draftText')) {
            update.draftText = normalizeDraftText(update.draftText);
            if (update.draftText === null) return sendError(res, 400, '文件內文格式不正確');
        }

        if (Object.keys(update).length === 0) {
      return sendError(res, 400, '沒有可更新的欄位');
        }

        const existing = await Document.findOne({ _id: req.params.id, userId: req.user.id })
            .select('encryptedPayload');
        if (!existing) return sendError(res, 404, '找不到文件');
        if (existing.encryptedPayload) return sendError(res, 409, '文件含有未轉換的密文，請先使用轉換功能');

        const doc = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: update, $inc: { version: 1 } },
            { new: true }
        );
        if (!doc) return sendError(res, 404, '找不到文件');
        return res.json(doc);
    } catch (err) {
        if (err.name === 'CastError') return sendError(res, 400, '文件 ID 格式不正確');
        console.error(err);
    return sendError(res, 500, '更新文件失敗');
    }
});

module.exports = router;
