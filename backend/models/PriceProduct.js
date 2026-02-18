const mongoose = require('mongoose');

const priceProductSchema = new mongoose.Schema({
  id_product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  prix: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PriceProduct', priceProductSchema);