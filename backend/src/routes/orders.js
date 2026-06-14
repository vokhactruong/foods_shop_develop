const router = require('express').Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const TableSession = require('../models/TableSession');
const { notifyStaff } = require('../utils/staffNotifications');



const PAID_STATUSES = ['paid'];

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Chá»‰ admin má»›i Ä‘Æ°á»£c xem chá»©c nÄƒng nÃ y' });
  }
  next();
}

// POST /api/orders â€” khÃ¡ch táº¡o Ä‘Æ¡n
router.post('/', async (req, res) => {
  try {
    const { token, items, note, isTakeaway } = req.body;

    if (!token || !items || !items.length) {
      return res.status(400).json({ message: 'Thiáº¿u thÃ´ng tin Ä‘Æ¡n hÃ ng' });
    }



    // Validate vÃ  tÃ­nh giÃ¡ tá»« DB
    const itemIds = items.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } }).lean();
    const menuById = new Map(menuItems.map((item) => [item._id.toString(), item]));
    const enrichedItems = [];
    let totalAmount = 0;

    const session = await TableSession.findOne({ token });

    if (!session || session.expiresAt <= new Date()) {

      if (session?._id) await TableSession.deleteOne({ _id: session._id });
      return res.status(403).json({ message: 'Phiên đăng nhập hết hạn, vui lòng quét lại mã QR để gọi món.', code: 'SessionExpired' });
    }




    for (const item of items) {
      const menuItem = menuById.get(item.menuItemId);
      if (!menuItem || !menuItem.available)
        return res.status(400).json({ message: `MÃ³n "${item.name}" khÃ´ng cÃ²n phá»¥c vá»¥` });

      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      enrichedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    const order = await Order.create({
      tableNumber: session.tableNumber,
      items: enrichedItems,
      totalAmount,
      note: note || '',
      isTakeaway: Boolean(isTakeaway),
      statusHistory: [{ status: 'new' }],
    });


    // Emit real-time tá»›i mÃ n hÃ¬nh báº¿p
    req.io.to('kitchen').emit('new_order', order);
    
    // Gá»­i thÃ´ng bÃ¡o Ä‘áº©y FCM tá»›i báº¿p khi cÃ³ Ä‘Æ¡n má»›i
    try {
      await notifyStaff(
        'Có đơn hàng mới',
        `Bàn ${session.tableNumber} vừa gọi món. Tổng: ${totalAmount.toLocaleString('vi-VN')}`,
        { type: 'new_order', orderId: order._id, tableNumber: session.tableNumber }
      );
    } catch (pushError) {
      console.error("Lá»—i gá»­i thÃ´ng bÃ¡o FCM:", pushError);
      // KhÃ´ng Ä‘á»ƒ lá»—i FCM lÃ m sáº­p luá»“ng táº¡o Ä‘Æ¡n cá»§a khÃ¡ch
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders â€” báº¿p/admin xem Ä‘Æ¡n
router.get('/', auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    } else {
      // Máº·c Ä‘á»‹nh xem Ä‘Æ¡n hÃ´m nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: today };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status â€” báº¿p cáº­p nháº­t tráº¡ng thÃ¡i
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'doing', 'done', 'served', 'paid', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Tráº¡ng thÃ¡i khÃ´ng há»£p lá»‡' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n' });

    order.status = status;
    await order.save();

    // Broadcast cáº­p nháº­t
    req.io.emit('order_updated', order);

    if (status === 'paid') {
      try {
        await notifyStaff(
          'Thanh toán thành công',
          `Đơn ${order.orderNumber || order._id} đã thanh toán ${order.totalAmount.toLocaleString('vi-VN')}d`,
          { type: 'payment_success', orderId: order._id }
        );
      } catch (pushError) {
        console.error('Loi gui thong bao thanh toan:', pushError);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/stats â€” thá»‘ng kÃª doanh thu
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const { range = 'today', startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate && range === '7d') start.setDate(start.getDate() - 6);
    if (!startDate && range === '30d') start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const dateFilter = { createdAt: { $gte: start, $lte: end } };
    const revenueFilter = { ...dateFilter, status: { $in: PAID_STATUSES } };

    const monthlyStart = new Date(end.getFullYear(), end.getMonth() - 11, 1);
    monthlyStart.setHours(0, 0, 0, 0);

    const [todayOrders, totalRevenue, statusBreakdown, revenueByDay, revenueByMonth, topItems, recentOrders] = await Promise.all([
      Order.countDocuments({ ...dateFilter, status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: revenueFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, paidOrders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: PAID_STATUSES },
            createdAt: { $gte: monthlyStart, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: revenueFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.find(dateFilter).sort({ createdAt: -1 }).limit(5).select('orderNumber tableNumber totalAmount status isTakeaway createdAt').lean(),
    ]);

    const revenueTotal = totalRevenue[0]?.total || 0;
    const paidOrders = totalRevenue[0]?.paidOrders || 0;

    res.json({
      todayOrders,
      todayRevenue: revenueTotal,
      range: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      paidOrders,
      averageOrderValue: paidOrders ? Math.round(revenueTotal / paidOrders) : 0,
      statusBreakdown,
      revenueByDay: revenueByDay.map((day) => ({
        date: day._id,
        revenue: day.revenue,
        orders: day.orders,
      })),
      revenueByMonth: revenueByMonth.map((month) => ({
        month: month._id,
        revenue: month.revenue,
        orders: month.orders,
      })),
      topItems: topItems.map((item) => ({
        name: item._id,
        quantity: item.quantity,
        revenue: item.revenue,
      })),
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;

