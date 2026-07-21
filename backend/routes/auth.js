const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');
const sendError = require('../utils/httpError');

const router = express.Router();

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedEmail || typeof password !== 'string' || !normalizedName) {
        return sendError(res, 400, '缺少必要欄位');
    }

    if (!isValidEmail(normalizedEmail)) {
        return sendError(res, 400, 'Email 格式不正確');
    }

    if (password.length < 6) {
        return sendError(res, 400, '密碼長度至少需要 6 碼');
    }

    try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return sendError(res, 409, 'Email 已被註冊');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: normalizedEmail,
            passwordHash,
            name: normalizedName,
        });

        return res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '註冊失敗');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string') {
        return sendError(res, 400, '缺少帳號或密碼');
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return sendError(res, 401, '帳號或密碼錯誤');
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            return sendError(res, 401, '帳號或密碼錯誤');
        }

        const token = jwt.sign({ id: user.id }, getJwtSecret(), {
            expiresIn: '7d',
        });

        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '登入失敗');
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string') {
        return sendError(res, 400, '缺少 Email 或新密碼');
    }

    if (!isValidEmail(normalizedEmail)) {
        return sendError(res, 400, 'Email 格式不正確');
    }

    if (password.length < 6) {
        return sendError(res, 400, '密碼長度至少需要 6 碼');
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return sendError(res, 404, '找不到此 Email 對應的帳號');
        }

        user.passwordHash = await bcrypt.hash(password, 10);
        await user.save();

        return res.json({ message: '密碼已更新' });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '重設密碼失敗');
    }
});

module.exports = router;
