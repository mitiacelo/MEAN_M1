const mongoose = require('mongoose');

const stockMouvementSchema = new mongoose.Schema({
  id_produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['entree', 'sortie'],
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  stock_apres: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StockMouvement', stockMouvementSchema);