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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snack-shop')
  .then(() => {
    console.log('✅ MongoDB kết nối thành công');
    const basePort = Number(process.env.PORT || 5000);

    const listenOnPort = (port, attemptsLeft = 10) => {
      server
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
            console.warn(`Port ${port} đã bị chiếm, thử port ${port + 1}...`);
            listenOnPort(port + 1, attemptsLeft - 1);
            return;
          }

          console.error('❌ Không thể khởi động server:', err.message);
          process.exit(1);
        })
        .listen(port, () => {
          console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
        });
    };

    listenOnPort(basePort);
  })
  .catch((err) => {
    console.error('❌ MongoDB lỗi:', err.message);
    process.exit(1);
  });
