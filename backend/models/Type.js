// backend/models/Type.js
const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom du type est obligatoire"],
    trim: true,
    minlength: [2, "Le nom doit contenir au moins 2 caractères"]
  },
  id_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, "La catégorie est obligatoire"]
  }
}, {
  timestamps: true
});

// Index pour accélérer les recherches
typeSchema.index({ id_category: 1, name: 1 });

module.exports = mongoose.model('Type', typeSchema);