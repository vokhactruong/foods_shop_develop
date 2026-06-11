const router = require('express').Router();
const crypto = require('crypto');
const TableSession = require('../models/TableSession');

const EXPIRES_IN_MS = 60 * 60 * 1000; // 1 giờ
const EXPIRED_MESSAGE = 'Phiên gọi món đã hết hạn, vui lòng quét lại QR.';

function createToken() {
  return crypto.randomBytes(16).toString('hex');
}

// POST /api/tables/sessions — tạo session cho bàn (token mới)
router.post('/', async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const tn = Number(tableNumber);
    if (!tn || tn < 1) return res.status(400).json({ message: 'tableNumber không hợp lệ' });

    const token = createToken();
    const expiresAt = new Date(Date.now() + EXPIRES_IN_MS);

    const session = await TableSession.create({ token, tableNumber: tn, expiresAt });
    res.status(201).json({ token: session.token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tables/sessions/validate?tableNumber=...&token=...
// - tableNumber không bắt buộc, backend chỉ tin vào token
router.get('/validate', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Thiếu token' });

    const session = await TableSession.findOne({ token });
    if (!session) return res.status(403).json({ message: EXPIRED_MESSAGE, code: 'SessionExpired' });

    const now = new Date();
    if (session.expiresAt <= now) {
      await TableSession.deleteOne({ _id: session._id });
      return res.status(403).json({ message: EXPIRED_MESSAGE, code: 'SessionExpired' });
    }

    return res.json({
      valid: true,
      tableNumber: session.tableNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


