const express = require('express');
const EndProfile = require('../models/EndProfile');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        let profile = await EndProfile.findOne({ userId: req.user.id });
        if (!profile) {
            profile = await EndProfile.create({ userId: req.user.id });
        }
        return res.json(profile);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '取得 EndProfile 失敗' });
    }
});

router.patch('/', auth, async (req, res) => {
    try {
        const update = req.body || {};
        const profile = await EndProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: update },
            { new: true, upsert: true }
        );
        return res.json(profile);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '更新 EndProfile 失敗' });
    }
});

module.exports = router;

