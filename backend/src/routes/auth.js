const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Mật khẩu không đúng' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register (chỉ dùng lần đầu setup)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

    const user = await User.create({ username, password, role: role || 'kitchen' });
    res.status(201).json({ message: 'Tạo tài khoản thành công', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
