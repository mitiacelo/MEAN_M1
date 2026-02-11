const mongoose = require('mongoose');

const GrilleSchema = new mongoose.Schema({
  lignes: { type: Number, required: true },
  colonnes: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Grille', GrilleSchema);