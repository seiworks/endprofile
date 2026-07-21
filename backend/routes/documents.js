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

const UPDATE_FIELDS = ['title', 'encryptedPayload', 'status'];

function normalizeEncryptedEnvelope(value) {
    if (!value || value.version !== 1 || value.algorithm !== 'AES-256-GCM') return null;
    if (typeof value.iv !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.iv) || value.iv.length > 64) return null;
    if (typeof value.ciphertext !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.ciphertext)) return null;
    return { version: 1, algorithm: 'AES-256-GCM', iv: value.iv, ciphertext: value.ciphertext };
}

function hasOwn(payload, field) {
    return Object.prototype.hasOwnProperty.call(payload, field);
}

router.get('/', auth, async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.user.id })
            .select('-structuredData -draftText')
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

        if (!payload.title || typeof payload.title !== 'string') {
      return sendError(res, 400, '缺少文件標題');
        }

        if (payload.status && !DOCUMENT_STATUS_VALUES.includes(payload.status)) {
      return sendError(res, 400, '文件狀態不正確');
        }
        const encryptedPayload = normalizeEncryptedEnvelope(payload.encryptedPayload);
        if (!encryptedPayload) {
            return sendError(res, 400, '文件必須以加密格式儲存');
        }

        const doc = await Document.create({
            userId: req.user.id,
            type: payload.type,
            title: payload.title.trim(),
            encryptedPayload,
            status: payload.status || DOCUMENT_STATUSES.DRAFT,
        });
        return res.status(201).json(doc);
    } catch (err) {
        console.error(err);
    return sendError(res, 500, '建立文件失敗');
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
            if (!update.title || typeof update.title !== 'string') {
        return sendError(res, 400, '文件標題不正確');
            }
            update.title = update.title.trim();
        }

        if (hasOwn(update, 'status') && !DOCUMENT_STATUS_VALUES.includes(update.status)) {
      return sendError(res, 400, '文件狀態不正確');
        }
        if (hasOwn(update, 'encryptedPayload')) {
            const encryptedPayload = normalizeEncryptedEnvelope(update.encryptedPayload);
            if (!encryptedPayload) return sendError(res, 400, '文件加密格式不正確');
            update.encryptedPayload = encryptedPayload;
        }

        if (Object.keys(update).length === 0) {
      return sendError(res, 400, '沒有可更新的欄位');
        }

        const doc = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                $set: update,
                $unset: { structuredData: 1, draftText: 1 },
                $inc: { version: 1 },
            },
            { new: true }
        );
        if (!doc) {
      return sendError(res, 404, '找不到文件');
        }
        return res.json(doc);
    } catch (err) {
        console.error(err);
    return sendError(res, 500, '更新文件失敗');
    }
});

module.exports = router;
