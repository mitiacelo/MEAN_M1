const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Infos du contrat remplies par l'admin
  loyer: {
    type: Number,
    required: true
  },
  charges: {
    type: Number,
    default: 0
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  dureeContrat: {
    type: String // ex: "12 mois"
  },
  clauses: {
    type: String,
    default: ''
  },
  depot: {
    type: Number,
    default: 0
  },

  // Statut du contrat
  // brouillon → signé_admin → signé_client → actif
  statut: {
    type: String,
    enum: ['brouillon', 'signé_admin', 'signé_client', 'actif', 'résilié'],
    default: 'brouillon'
  },

  // Dates de signature
  dateSignatureAdmin: { type: Date },
  dateSignatureClient: { type: Date },

  // Token unique pour le lien de signature client (envoyé par email)
  tokenSignature: { type: String },
  tokenExpire: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);