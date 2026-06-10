const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['che', 'suachua', 'caramen', 'monmoi', 'douong', 'doanutat', 'pizza', 'mycay'],
      default: 'monmoi',
    },
    emoji: { type: String, default: '🍿' },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ available: 1, category: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
