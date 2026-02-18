const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de la boutique est obligatoire"],
    trim: true,
    minlength: [3, "Le nom doit contenir au moins 3 caractères"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [800, "La description ne peut pas dépasser 800 caractères"]
  },
  status: {
    type: String,
    enum: ['actif', 'inactif', 'en attente'],
    default: 'inactif',
    required: true
  },
  superficie: {
    type: Number,
    required: [true, "La superficie est obligatoire"],
    min: [5, "La superficie doit être au moins 5 m²"]
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // facultatif
  },
  color: {
    type: String,
    default: null
  },
  id_boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    unique: true,
    sparse: true
  }
}, {
  timestamps: true   // createdAt & updatedAt automatiques
});

module.exports = mongoose.model('Shop', shopSchema);