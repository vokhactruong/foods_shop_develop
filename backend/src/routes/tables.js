const router = require('express').Router();
const QRCode = require('qrcode');
const Table = require('../models/Table');
const auth = require('../middleware/auth');

const CUSTOMER_URL = process.env.FRONTEND_CUSTOMER_URL || 'http://localhost:5173';

// GET /api/tables — lấy danh sách bàn + QR data URL
router.get('/', auth, async (_req, res) => {
  try {
    const tables = await Table.find({ active: true }).sort({ number: 1 });
    const tablesWithQR = await Promise.all(
      tables.map(async (t) => {
        const url = `${CUSTOMER_URL}/order?table=${t.number}`;
        const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
        return { ...t.toObject(), qrUrl: url, qrDataUrl };
      })
    );
    res.json(tablesWithQR);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tables — thêm bàn
router.post('/', auth, async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tables/bulk — tạo nhiều bàn cùng lúc
router.post('/bulk', auth, async (req, res) => {
  try {
    const { count } = req.body;
    const n = parseInt(count) || 10;
    const tables = [];
    for (let i = 1; i <= n; i++) {
      const exists = await Table.findOne({ number: i });
      if (!exists) tables.push({ number: i, name: `Bàn ${i}`, capacity: 4 });
    }
    if (tables.length) await Table.insertMany(tables);
    res.json({ message: `Đã tạo ${tables.length} bàn`, created: tables.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tables/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Table.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Đã xóa bàn' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
