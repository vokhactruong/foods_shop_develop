const router = require('express').Router();
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { key: 'che', label: 'Che', icon: '🍵', sortOrder: 10 },
  { key: 'suachua', label: 'Sua Chua', icon: '🥛', sortOrder: 20 },
  { key: 'caramen', label: 'Caramen', icon: '🍮', sortOrder: 30 },
  { key: 'monmoi', label: 'Mon Moi', icon: '✨', sortOrder: 40 },
  { key: 'douong', label: 'Do Uong', icon: '🧋', sortOrder: 50 },
  { key: 'doanutat', label: 'An Vat', icon: '🧀', sortOrder: 60 },
  { key: 'pizza', label: 'Pizza', icon: '🍕', sortOrder: 70 },
  { key: 'mycay', label: 'My Cay', icon: '🌶️', sortOrder: 80 },
];

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Chi admin moi duoc thao tac chuc nang nay' });
  }
  next();
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureDefaultCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false });
}

router.get('/', async (_req, res) => {
  try {
    await ensureDefaultCategories();
    const categories = await Category.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/all', auth, requireAdmin, async (_req, res) => {
  try {
    await ensureDefaultCategories();
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const key = slugify(req.body.key || req.body.label);
    if (!key) return res.status(400).json({ message: 'Vui long nhap ma hoac ten danh muc' });

    const category = await Category.create({
      key,
      label: req.body.label,
      icon: req.body.icon || '',
      active: req.body.active ?? true,
      sortOrder: Number(req.body.sortOrder || 0),
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? 'Ma danh muc da ton tai' : err.message });
  }
});

router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const current = await Category.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Khong tim thay danh muc' });

    const nextKey = req.body.key ? slugify(req.body.key) : current.key;
    const previousKey = current.key;

    current.key = nextKey;
    current.label = req.body.label ?? current.label;
    current.icon = req.body.icon ?? current.icon;
    current.active = req.body.active ?? current.active;
    current.sortOrder = req.body.sortOrder === undefined ? current.sortOrder : Number(req.body.sortOrder || 0);
    await current.save();

    if (previousKey !== nextKey) {
      await MenuItem.updateMany({ category: previousKey }, { $set: { category: nextKey } });
    }

    res.json(current);
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? 'Ma danh muc da ton tai' : err.message });
  }
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Khong tim thay danh muc' });

    const usedCount = await MenuItem.countDocuments({ category: category.key });
    if (usedCount > 0) {
      return res.status(400).json({ message: 'Danh muc dang co mon, hay chuyen mon sang danh muc khac truoc khi xoa' });
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Da xoa danh muc' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
