require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const User = require('./models/User');
const Order = require('./models/Order');

const MIN_MONTHLY_REVENUE = 20000000;
const MAX_MONTHLY_REVENUE = 25000000;

// const MENU_ITEMS = [
//   { name: 'Snack Lays phô mai', price: 15000, category: 'chips', emoji: '🧀', description: 'Khoai tây chiên vị phô mai' },
//   { name: 'Snack Oishi tôm', price: 12000, category: 'chips', emoji: '🍤', description: 'Snack vị tôm giòn rụm' },
//   { name: 'Pringles Original', price: 35000, category: 'chips', emoji: '🥔', description: 'Khoai tây ống nhập khẩu' },
//   { name: 'Khoai tây chiên nóng', price: 25000, category: 'hot', emoji: '🍟', description: 'Khoai tây chiên giòn, phục vụ nóng' },
//   { name: 'Bánh tráng nướng', price: 20000, category: 'hot', emoji: '🥘', description: 'Bánh tráng phết mỡ hành và trứng' },
//   { name: 'Trứng cút chiên', price: 18000, category: 'hot', emoji: '🍳', description: '10 quả trứng cút chiên vàng' },
//   { name: 'Trà sữa trân châu', price: 35000, category: 'drink', emoji: '🧋', description: 'Trà sữa Thái trân châu đen' },
//   { name: 'Pepsi lon', price: 12000, category: 'drink', emoji: '🥤', description: 'Pepsi 330ml lon' },
//   { name: 'Nước ép cam', price: 25000, category: 'drink', emoji: '🍊', description: 'Cam tươi ép 250ml' },
//   { name: 'Trà đào cam sả', price: 30000, category: 'drink', emoji: '🍑', description: 'Trà đào thơm mát' },
//   { name: 'Bánh Oreo', price: 14000, category: 'sweet', emoji: '🍪', description: 'Bánh quy kem vị socola' },
//   { name: 'Kẹo bông gòn', price: 10000, category: 'sweet', emoji: '🍭', description: 'Kẹo bông đủ màu sắc' },
//   { name: 'Choco Pie', price: 8000, category: 'sweet', emoji: '🍫', description: 'Bánh bông lan phủ socola' },
//   { name: 'Combo phim 1 người', price: 49000, category: 'other', emoji: '🎬', description: 'Snack, nước và bánh ngọt' },
//   { name: 'Combo nhóm bạn', price: 129000, category: 'other', emoji: '🍿', description: 'Phần ăn vặt cho 3-4 người' },
// ];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date) {
  const next = new Date(date);
  next.setDate(1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfMonth(date) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1, 0);
  next.setHours(23, 59, 59, 999);
  return next;
}

function randomOrderDate(day) {
  const date = new Date(day);
  const hour = pickWeighted([
    { value: randomInt(9, 11), weight: 15 },
    { value: randomInt(12, 14), weight: 25 },
    { value: randomInt(15, 17), weight: 20 },
    { value: randomInt(18, 21), weight: 40 },
  ]);
  date.setHours(hour, randomInt(0, 59), randomInt(0, 59), 0);
  return date;
}

function randomDateInRange(start, end) {
  const dayCount = Math.max(1, Math.ceil((end - start) / 86400000));
  return randomOrderDate(addDays(start, randomInt(0, dayCount - 1)));
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isPaidStatus(status) {
  return status === 'paid';
}

function createItems(weightedMenu) {
  const itemCount = pickWeighted([
    { value: 1, weight: 44 },
    { value: 2, weight: 38 },
    { value: 3, weight: 15 },
    { value: 4, weight: 3 },
  ]);
  const picked = new Map();

  for (let i = 0; i < itemCount; i += 1) {
    const menuItem = pickWeighted(weightedMenu);
    const quantity = menuItem.category === 'other'
      ? 1
      : pickWeighted([
        { value: 1, weight: 72 },
        { value: 2, weight: 24 },
        { value: 3, weight: 4 },
      ]);
    const current = picked.get(String(menuItem._id));
    picked.set(String(menuItem._id), {
      menuItem,
      quantity: (current?.quantity || 0) + quantity,
    });
  }

  return Array.from(picked.values()).map(({ menuItem, quantity }) => ({
    menuItem: menuItem._id,
    name: menuItem.name,
    price: menuItem.price,
    quantity,
    subtotal: menuItem.price * quantity,
  }));
}

async function upsertBaseData() {
  await User.updateOne({ username: 'admin' }, { $setOnInsert: { password: 'admin123', role: 'admin' } }, { upsert: true });
  await User.updateOne({ username: 'bep' }, { $setOnInsert: { password: 'bep123', role: 'kitchen' } }, { upsert: true });

  for (const item of MENU_ITEMS) {
    await MenuItem.updateOne({ name: item.name }, { $set: { ...item, available: true } }, { upsert: true });
  }

  for (let i = 1; i <= 14; i += 1) {
    await Table.updateOne(
      { number: i },
      { $set: { number: i, name: `Bàn ${i}`, capacity: i <= 10 ? 4 : 6, active: true } },
      { upsert: true }
    );
  }
}

async function seedDemoYear() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snack-shop');
  console.log('MongoDB connected');

  await upsertBaseData();
  await Order.deleteMany({ orderNumber: /^DEMO-/ });

  const menu = await MenuItem.find({ available: true }).lean();
  const menuByName = new Map(menu.map((item) => [item.name, item]));
  const weightedMenu = MENU_ITEMS.map((item) => ({
    value: menuByName.get(item.name),
    weight: item.category === 'drink' ? 7 : item.category === 'hot' ? 5 : item.category === 'other' ? 1 : 4,
  })).filter((item) => item.value);

  const now = new Date();
  const firstMonth = startOfMonth(now);
  firstMonth.setMonth(firstMonth.getMonth() - 11);

  const orders = [];
  const monthlyRevenue = new Map();
  let sequence = 1;

  for (let monthStart = new Date(firstMonth); monthStart <= now; monthStart.setMonth(monthStart.getMonth() + 1)) {
    const monthEnd = monthKey(monthStart) === monthKey(now) ? now : endOfMonth(monthStart);
    const targetRevenue = randomInt(MIN_MONTHLY_REVENUE, MAX_MONTHLY_REVENUE - 500000);
    let paidRevenue = 0;
    let attempts = 0;

    while (paidRevenue < targetRevenue && attempts < 1200) {
      attempts += 1;
      const createdAt = randomDateInRange(monthStart, monthEnd);
      const status = pickWeighted([
        { value: 'paid', weight: 82 },
        { value: 'served', weight: 9 },
        { value: 'cancelled', weight: 4 },
        { value: 'doing', weight: 4 },
        { value: 'new', weight: 1 },
      ]);
      const items = createItems(weightedMenu);
      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      if (isPaidStatus(status) && paidRevenue >= MIN_MONTHLY_REVENUE && paidRevenue + totalAmount > MAX_MONTHLY_REVENUE) {
        break;
      }

      if (isPaidStatus(status)) paidRevenue += totalAmount;
      orders.push({
        orderNumber: `DEMO-${dateKey(createdAt).replace(/-/g, '')}-${String(sequence).padStart(5, '0')}`,
        tableNumber: randomInt(1, 14),
        items,
        totalAmount,
        note: '',
        status,
        statusHistory: [{ status: 'new', changedAt: createdAt }, { status, changedAt: createdAt }],
        createdAt,
        updatedAt: createdAt,
      });
      sequence += 1;
    }

    monthlyRevenue.set(monthKey(monthStart), paidRevenue);
  }

  orders.sort((a, b) => a.createdAt - b.createdAt);
  orders.forEach((order, index) => {
    order.orderNumber = `DEMO-${dateKey(order.createdAt).replace(/-/g, '')}-${String(index + 1).padStart(5, '0')}`;
  });

  await Order.insertMany(orders, { ordered: false });
  console.log(`Created ${orders.length} demo orders across 12 months`);
  for (const [month, revenue] of monthlyRevenue.entries()) {
    console.log(`${month}: ${revenue.toLocaleString('vi-VN')} VND`);
  }
  // console.log('Login: admin/admin123 or bep/bep123');

  await mongoose.disconnect();
}

seedDemoYear().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
