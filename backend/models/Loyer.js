const mongoose = require('mongoose');

const loyerSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
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

  mois: { type: Number, required: true }, // 1-12
  annee: { type: Number, required: true },

  montant: { type: Number, required: true }, // loyer + charges
  loyer: { type: Number, required: true },
  charges: { type: Number, required: true },

  statut: {
    type: String,
    enum: ['en_attente', 'payé', 'en_retard'],
    default: 'en_attente'
  },

  datePaiement: { type: Date, default: null },
  note: { type: String, default: '' }, // note admin optionnelle

}, { timestamps: true });

// Index unique : un seul enregistrement par contrat/mois/année
loyerSchema.index({ contract: 1, mois: 1, annee: 1 }, { unique: true });

module.exports = mongoose.model('Loyer', loyerSchema);