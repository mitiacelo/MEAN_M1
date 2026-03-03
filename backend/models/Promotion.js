const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },

  discountValue: {
    type: Number,
    required: true
  },

  startDate: Date,
  endDate: Date,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);