const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');
const sendError = require('../utils/httpError');
const auth = require('../middleware/auth');

const router = express.Router();

function sessionCookie(token) {
    const secure = process.env.NODE_ENV === 'production';
    const name = secure ? '__Host-endprofile_session' : 'endprofile_session';
    return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}; Max-Age=604800`;
}

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string') {
        return sendError(res, 400, '缺少必要欄位');
    }

    if (!isValidEmail(normalizedEmail)) {
        return sendError(res, 400, 'Email 格式不正確');
    }

    if (password.length < 12 || password.length > 72) {
        return sendError(res, 400, '密碼長度需為 12 至 72 碼');
    }

    try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return sendError(res, 409, 'Email 已被註冊');
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: normalizedEmail,
            passwordHash,
        });

        return res.status(201).json({ id: user.id, email: user.email });
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
        const user = await User.findOne({ email: normalizedEmail }).select('+sessionVersion');
        if (!user) {
            return sendError(res, 401, '帳號或密碼錯誤');
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            return sendError(res, 401, '帳號或密碼錯誤');
        }

        const sessionVersion = Number(user.sessionVersion) || 0;
        const token = jwt.sign({ id: user.id, sv: sessionVersion }, getJwtSecret(), {
            expiresIn: '7d',
        });

        await User.updateOne({ _id: user.id }, { $set: { lastLoginAt: new Date() } });
        res.setHeader('Set-Cookie', sessionCookie(token));

        return res.json({
            user: { id: user.id, email: user.email },
            vaultMetadata: user.vaultMetadata,
        });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '登入失敗');
    }
});

router.post('/logout', auth, async (req, res) => {
    await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
    res.setHeader('Set-Cookie', [
        'endprofile_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        '__Host-endprofile_session=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0',
    ]);
    return res.status(204).end();
});

router.post('/reset-password', async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body && req.body.email);
    const { password } = req.body || {};
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) return sendError(res, 400, 'Email 格式不正確');
    if (typeof password !== 'string' || password.length < 12 || password.length > 72) {
        return sendError(res, 400, '密碼長度需為 12 至 72 碼');
    }
    const user = await User.findOne({ email: normalizedEmail }).select('+sessionVersion');
    if (!user) return sendError(res, 404, '找不到此 Email 的帳號');
    user.passwordHash = await bcrypt.hash(password, 12);
    user.sessionVersion = (Number(user.sessionVersion) || 0) + 1;
    await user.save();
    return res.json({ message: '密碼已更新，請重新登入' });
});

module.exports = router;
