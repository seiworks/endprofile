const express = require('express');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '取得文件清單失敗' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ message: '找不到文件' });
    }
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '取得文件失敗' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body || {};
    const doc = await Document.create({
      userId: req.user.id,
      type: payload.type,
      title: payload.title,
      structuredData: payload.structuredData || {},
      draftText: payload.draftText || '',
      status: payload.status || 'DRAFT',
    });
    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '建立文件失敗' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const payload = req.body || {};
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        $set: {
          title: payload.title,
          structuredData: payload.structuredData,
          draftText: payload.draftText,
          status: payload.status,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: '找不到文件' });
    }
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '更新文件失敗' });
  }
});

module.exports = router;

