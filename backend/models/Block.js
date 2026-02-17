const mongoose = require('mongoose');
const BlockSchema = new mongoose.Schema({
  grilleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Grille', 
    required: true 
  }, // Lien vers la grille parente
  
  blockId: { 
    type: String, 
    required: true 
  }, // Ex: "A1", "B3", "C5"
  
  ligne: { 
    type: String, 
    required: true 
  }, // Ex: "A", "B", "C"
  
  colonne: { 
    type: Number, 
    required: true 
  }, // Ex: 1, 2, 3
  
  contenu: { 
    type: String, 
    default: '' 
  }, // Pour stocker du texte/couleur/etc plus tard
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    default: null
  },
  color: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Block', BlockSchema);