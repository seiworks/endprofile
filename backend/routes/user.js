const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendError = require('../utils/httpError');

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

module.exports = router;
