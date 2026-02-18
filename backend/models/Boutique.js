const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de la boutique est obligatoire"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  id_shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    unique: true  // Une salle ne peut avoir qu'une seule boutique active
  },
  id_domaine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domaine',
    required: [true, "Le domaine est obligatoire"]
  },
}, {
    timestamps: true
  });

module.exports = mongoose.model('Boutique', boutiqueSchema);