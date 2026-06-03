module.exports = function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client kết nối: ${socket.id}`);

    socket.on('join_kitchen', () => {
      socket.join('kitchen');
      console.log(`👨‍🍳 Bếp đã kết nối: ${socket.id}`);
      socket.emit('kitchen_joined', { message: 'Kết nối bếp thành công' });
    });

    socket.on('join_table', (tableNumber) => {
      socket.join(`table_${tableNumber}`);
      console.log(`🪑 Khách tham gia bàn ${tableNumber}: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client ngắt kết nối: ${socket.id}`);
    });
  });
};
