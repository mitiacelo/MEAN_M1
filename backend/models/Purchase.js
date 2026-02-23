const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    priceAtPurchase: Number
  }],
  totalProducts: { type: Number, required: true },
  deliveryFee: { type: Number, default: 5000 },
  grandTotal: { type: Number, required: true },
  deliveryAddress: {
    city: String,
    district: String,
    address: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_payment'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);