require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const authRoutes = require('./routes/auth');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

function buildAllowedOrigins() {
  const origins = new Set([
    process.env.FRONTEND_CUSTOMER_URL,
    process.env.FRONTEND_KITCHEN_URL,
    ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : []),
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter(Boolean).map((origin) => origin.trim()));

  return [...origins];
}

const allowedOrigins = buildAllowedOrigins();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());

// Gắn io vào req để dùng trong routes
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

initSocket(io);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snack-shop')
  .then(() => {
    console.log('✅ MongoDB kết nối thành công');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB lỗi:', err.message);
    process.exit(1);
  });
