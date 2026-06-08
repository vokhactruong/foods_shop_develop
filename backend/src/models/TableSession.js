const mongoose = require('mongoose');

const tableSessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    tableNumber: { type: Number, required: true, min: 1 },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL tự xóa khi hết hạn
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TableSession', tableSessionSchema);

