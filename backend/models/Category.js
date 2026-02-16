// backend/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de la catégorie est obligatoire"],
    trim: true,
    minlength: [2, "Le nom doit contenir au moins 2 caractères"]
  },
  id_domaine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domaine',
    required: [true, "Le domaine est obligatoire"]
  }
}, {
  timestamps: true
});

// Index pour accélérer les recherches
categorySchema.index({ id_domaine: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);