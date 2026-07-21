const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: '缺少必要欄位' });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email 已被註冊' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            passwordHash,
            name,
        });

        return res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '註冊失敗' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '缺少帳號或密碼' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: '帳號或密碼錯誤' });
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).json({ message: '帳號或密碼錯誤' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '登入失敗' });
    }
});

module.exports = router;

