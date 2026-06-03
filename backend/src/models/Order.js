const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    tableNumber: { type: Number, required: true, min: 1 },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'doing', 'done', 'served', 'paid', 'cancelled'],
      default: 'new',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Tự sinh mã đơn hàng trước khi lưu
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const pad = String(count + 1).padStart(4, '0');
    this.orderNumber = `ORD-${pad}`;
  }
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
