// models/Product.js (version simplifiée et cohérente)
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  id_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type',
    required: [true, "Le type de produit est obligatoire"]
  },
  id_shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, "Le produit doit appartenir à une boutique"]
  },
  quantite: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
}, {
  timestamps: true
});

productSchema.index({ id_shop: 1 });
productSchema.index({ id_type: 1 });

module.exports = mongoose.model('Product', productSchema);