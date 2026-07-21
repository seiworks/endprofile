const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');
const sendError = require('../utils/httpError');
const normalizeVaultMetadata = require('../utils/vaultMetadata');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const RecoveryChallenge = require('../models/RecoveryChallenge');

const router = express.Router();
const RECOVERY_CHALLENGE_TTL_MS = 5 * 60 * 1000;

function sessionCookie(token, rememberMe = false) {
    const secure = process.env.NODE_ENV === 'production';
    const name = secure ? '__Host-endprofile_session' : 'endprofile_session';
    const persistence = rememberMe ? '; Max-Age=604800' : '';
    return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}${persistence}`;
}

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeEqual(left, right) {
    const leftBuffer = Buffer.from(String(left || ''));
    const rightBuffer = Buffer.from(String(right || ''));
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

router.post('/register', async (req, res) => {
    const { email, password, name, vaultMetadata, inviteCode } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    if (!process.env.REGISTRATION_INVITE_CODE) {
        return sendError(res, 503, '目前未開放註冊');
    }
    if (!safeEqual(inviteCode, process.env.REGISTRATION_INVITE_CODE)) {
        return sendError(res, 403, '邀請碼不正確');
    }

    const safeVaultMetadata = normalizeVaultMetadata(vaultMetadata);
    if (!normalizedEmail || typeof password !== 'string' || !normalizedName || !safeVaultMetadata) {
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
            name: normalizedName,
            vaultMetadata: safeVaultMetadata,
        });

        return res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, '註冊失敗');
    }
});

router.post('/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;
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
        const persistentSession = rememberMe === true;
        const token = jwt.sign({ id: user.id, sv: sessionVersion }, getJwtSecret(), {
            expiresIn: persistentSession ? '7d' : '8h',
        });

        await User.updateOne({ _id: user.id }, { $set: { lastLoginAt: new Date() } });
        res.setHeader('Set-Cookie', sessionCookie(token, persistentSession));

        return res.json({
            user: { id: user.id, email: user.email, name: user.name },
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

router.post('/recovery-challenge', async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body && req.body.email);
    if (!normalizedEmail) return sendError(res, 400, '缺少 Email');
    const user = await User.findOne({ email: normalizedEmail }).select('vaultMetadata');
    if (!user || !user.vaultMetadata || !user.vaultMetadata.recoveryPublicKey) {
        return sendError(res, 404, '找不到可復原的帳號');
    }
    const id = crypto.randomUUID();
    const challenge = crypto.randomBytes(32).toString('base64');
    await RecoveryChallenge.create({
        challengeId: id,
        userId: user.id,
        challenge,
        expiresAt: new Date(Date.now() + RECOVERY_CHALLENGE_TTL_MS),
    });
    return res.json({ id, challenge, vaultMetadata: user.vaultMetadata });
});

router.post('/reset-password', async (req, res) => {
    const { challengeId, signature, password, vaultMetadata } = req.body || {};
    const challengeRecord = await RecoveryChallenge.findOneAndDelete({
        challengeId,
        expiresAt: { $gt: new Date() },
    });
    if (!challengeRecord) {
        return sendError(res, 400, '復原驗證已失效');
    }
    if (typeof password !== 'string' || password.length < 12 || password.length > 72) {
        return sendError(res, 400, '密碼長度需為 12 至 72 碼');
    }
    const safeMetadata = normalizeVaultMetadata(vaultMetadata);
    if (!safeMetadata || typeof signature !== 'string') return sendError(res, 400, '復原資料格式不正確');
    const user = await User.findById(challengeRecord.userId).select('+sessionVersion');
    if (!user) return sendError(res, 400, '復原驗證失敗');
    const oldMetadata = normalizeVaultMetadata(user.vaultMetadata);
    if (!oldMetadata || safeMetadata.recoveryPublicKey !== oldMetadata.recoveryPublicKey
        || JSON.stringify(safeMetadata.recoveryWrap) !== JSON.stringify(oldMetadata.recoveryWrap)) {
        return sendError(res, 400, '復原金鑰資料不一致');
    }
    let verified = false;
    try {
        verified = crypto.verify(
            'sha256', Buffer.from(challengeRecord.challenge, 'base64'),
            { key: crypto.createPublicKey({ key: Buffer.from(oldMetadata.recoveryPublicKey, 'base64'), format: 'der', type: 'spki' }), dsaEncoding: 'ieee-p1363' },
            Buffer.from(signature, 'base64'),
        );
    } catch {
        verified = false;
    }
    if (!verified) return sendError(res, 401, '復原金鑰不正確');
    user.passwordHash = await bcrypt.hash(password, 12);
    user.vaultMetadata = { ...oldMetadata, passwordWrap: safeMetadata.passwordWrap };
    user.sessionVersion = (Number(user.sessionVersion) || 0) + 1;
    await user.save();
    return res.json({ message: '密碼已安全更新' });
});

module.exports = router;
