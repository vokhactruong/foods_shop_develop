const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    icon: { type: String, default: '' },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ active: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model('Category', categorySchema);
