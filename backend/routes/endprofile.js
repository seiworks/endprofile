const express = require('express');
const EndProfile = require('../models/EndProfile');
const auth = require('../middleware/auth');
const sendError = require('../utils/httpError');

const router = express.Router();

const OVERALL_STATUSES = ['DRAFT', 'COMPLETED_PARTIAL', 'COMPLETED'];
const STEP_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_FIELDS = [
    'willStatus',
    'cohabitationStatus',
    'guardianshipStatus',
    'lifeAuthorizationStatus',
    'jointPurchaseStatus',
];

function hasOwn(payload, field) {
    return Object.prototype.hasOwnProperty.call(payload, field);
}

router.get('/', auth, async (req, res) => {
    try {
        let profile = await EndProfile.findOne({ userId: req.user.id });
        if (!profile) {
            profile = await EndProfile.create({ userId: req.user.id });
        }
        return res.json(profile);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '取得 EndProfile 失敗');
    }
});

router.patch('/', auth, async (req, res) => {
    try {
        const payload = req.body || {};
        const update = {};

        if (hasOwn(payload, 'overallStatus')) {
            if (!OVERALL_STATUSES.includes(payload.overallStatus)) {
                return sendError(res, 400, '整體狀態不正確');
            }
            update.overallStatus = payload.overallStatus;
        }

        for (const field of STATUS_FIELDS) {
            if (hasOwn(payload, field)) {
                if (!STEP_STATUSES.includes(payload[field])) {
                    return sendError(res, 400, '文件狀態不正確');
                }
                update[field] = payload[field];
            }
        }

        if (hasOwn(payload, 'preferences')) {
            if (payload.preferences === null || typeof payload.preferences !== 'object' || Array.isArray(payload.preferences)) {
                return sendError(res, 400, '偏好設定格式不正確');
            }
            update.preferences = payload.preferences;
        }

        if (Object.keys(update).length === 0) {
            return sendError(res, 400, '沒有可更新的欄位');
        }

        const profile = await EndProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: update },
            { new: true, upsert: true }
        );
        return res.json(profile);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '更新 EndProfile 失敗');
    }
});

module.exports = router;
