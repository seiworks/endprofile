const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendError = require('../utils/httpError');
const normalizeVaultMetadata = require('../utils/vaultMetadata');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email name locale');
    if (!user) {
      return sendError(res, 404, '找不到使用者');
    }
    return res.json(user);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, '取得使用者資料失敗');
  }
});

router.patch('/vault', auth, async (req, res) => {
  const vaultMetadata = normalizeVaultMetadata(req.body && req.body.vaultMetadata);
  if (!vaultMetadata) {
    return sendError(res, 400, '加密資料格式不正確');
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.id, vaultMetadata: { $exists: false } },
    { $set: { vaultMetadata } },
    { new: true }
  ).select('vaultMetadata');
  if (!user) return sendError(res, 409, '加密資料已存在，禁止覆寫');
  return res.json({ vaultMetadata: user.vaultMetadata });
});

module.exports = router;
