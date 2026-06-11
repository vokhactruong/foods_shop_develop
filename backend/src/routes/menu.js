const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới được thao tác chức năng này' });
  }
  next();
}

// GET /api/menu — public (khách hàng xem menu)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { available: true };
    if (category && category !== 'all') filter.category = category;
    const items = await MenuItem.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/all — admin (bao gồm món đã ẩn)
router.get('/all', auth, requireAdmin, async (_req, res) => {
  try {
    const items = await MenuItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu — admin thêm món
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/menu/:id — admin sửa món
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy món' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id — admin xóa món
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy món' });
    res.json({ message: 'Đã xóa món' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
