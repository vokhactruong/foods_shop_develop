const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const { notifyStaff } = require('../utils/staffNotifications');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Chá»‰ admin má»›i Ä‘Æ°á»£c thao tÃ¡c chá»©c nÄƒng nÃ y' });
  }
  next();
}

// GET /api/menu â€” public (khÃ¡ch hÃ ng xem menu)
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

// GET /api/menu/all â€” admin (bao gá»“m mÃ³n Ä‘Ã£ áº©n)
router.get('/all', auth, requireAdmin, async (_req, res) => {
  try {
    const items = await MenuItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu â€” admin thÃªm mÃ³n
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/menu/:id - admin sua mon
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const previousItem = await MenuItem.findById(req.params.id).lean();
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Khong tim thay mon' });

    if (previousItem?.available && req.body.available === false) {
      try {
        await notifyStaff(
          'Mon da het hang',
          `${item.name} vua duoc chuyen sang trang thai het hang`,
          { type: 'out_of_stock', menuItemId: item._id }
        );
      } catch (pushError) {
        console.error('Loi gui thong bao het hang:', pushError);
      }
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id â€” admin xÃ³a mÃ³n
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y mÃ³n' });
    res.json({ message: 'ÄÃ£ xÃ³a mÃ³n' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

