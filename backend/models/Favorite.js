const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index unique : un user ne peut pas avoir deux fois le même produit en favori
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);