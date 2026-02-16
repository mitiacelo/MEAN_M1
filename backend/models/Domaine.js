// backend/models/Domaine.js
const mongoose = require('mongoose');

const domaineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom du domaine est obligatoire"],
    trim: true,
    unique: true,
    enum: ['sport', 'beauty', 'clothes', 'food', 'tech', 'home', 'other'], // exemples, ajoute les tiens
    minlength: [3, "Le nom doit contenir au moins 3 caractères"]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Domaine', domaineSchema);