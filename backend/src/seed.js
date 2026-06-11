require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snack-shop');
  console.log('✅ Kết nối MongoDB');

  // Xóa dữ liệu cũ
  await Promise.all([MenuItem.deleteMany(), Table.deleteMany(), User.deleteMany()]);

  // Tạo tài khoản admin và bếp
  await User.create([
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'bep', password: 'bep123', role: 'kitchen' },
  ]);
  // console.log('👤 Tạo tài khoản: admin/admin123, bep/bep123');

  // Tạo menu
  // await MenuItem.create([
  //   { name: 'Snack Lays phô mai', price: 15000, category: 'chips', emoji: '🧀', description: 'Khoai tây chiên vị phô mai' },
  //   { name: 'Snack Oishi tôm', price: 12000, category: 'chips', emoji: '🍤', description: 'Snack vị tôm giòn rụm' },
  //   { name: 'Pringles Original', price: 35000, category: 'chips', emoji: '🥔', description: 'Khoai tây ống nhập khẩu' },
  //   { name: 'Khoai tây chiên nóng', price: 25000, category: 'hot', emoji: '🍟', description: 'Khoai tây chiên giòn, phục vụ nóng' },
  //   { name: 'Bánh tráng nướng', price: 20000, category: 'hot', emoji: '🫓', description: 'Bánh tráng phết mỡ hành và trứng' },
  //   { name: 'Trứng cút chiên', price: 18000, category: 'hot', emoji: '🍳', description: '10 quả trứng cút chiên vàng' },
  //   { name: 'Trà sữa trân châu', price: 35000, category: 'drink', emoji: '🧋', description: 'Trà sữa Thái trân châu đen' },
  //   { name: 'Pepsi lon', price: 12000, category: 'drink', emoji: '🥤', description: 'Pepsi 330ml lon' },
  //   { name: 'Nước ép cam', price: 25000, category: 'drink', emoji: '🍊', description: 'Cam tươi ép 250ml' },
  //   { name: 'Trà đào cam sả', price: 30000, category: 'drink', emoji: '🍑', description: 'Trà đào thơm mát' },
  //   { name: 'Bánh Oreo', price: 14000, category: 'sweet', emoji: '🍪', description: 'Bánh quy kem vị socola' },
  //   { name: 'Kẹo bông gòn', price: 10000, category: 'sweet', emoji: '🍭', description: 'Kẹo bông đủ màu sắc' },
  //   { name: 'Choco Pie', price: 8000, category: 'sweet', emoji: '🍫', description: 'Bánh bông lan phủ socola' },
  // ]);
  console.log('🍿 Tạo 13 món ăn');

  // Tạo 10 bàn
  const tables = Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    name: `Bàn ${i + 1}`,
    capacity: 4,
    active: true,
  }));
  await Table.create(tables);
  console.log('🪑 Tạo 10 bàn');

  await mongoose.disconnect();
  console.log('\n✅ Seed hoàn thành!');
  console.log('   Đăng nhập bếp/admin: http://localhost:5174/login');
}

seed().catch((e) => { console.error(e); process.exit(1); });
