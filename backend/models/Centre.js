const mongoose = require('mongoose');

const centreSchema = new mongoose.Schema({
  // ── Identité ──
  nom:        { type: String, required: true, trim: true },
  slogan:     { type: String, trim: true, default: '' },
  logo:       { type: String, default: '' },      // URL fichier uploadé
  banniere:   { type: String, default: '' },      // image hero landing

  // ── Coordonnées ──
  adresse:    { type: String, trim: true, default: '' },
  ville:      { type: String, trim: true, default: '' },
  telephone:  { type: String, trim: true, default: '' },
  email:      { type: String, trim: true, default: '' },
  siteWeb:    { type: String, trim: true, default: '' },

  // ── Landing page ──
  description:    { type: String, trim: true, default: '' },  // paragraphe d'intro
  heureOuverture: { type: String, trim: true, default: '' },  // ex: "Lun–Sam 9h–20h"
  nombreBoutiques:{ type: Number, default: 0 },
  nombreVisiteurs:{ type: String, trim: true, default: '' },  // ex: "500 000 / an"
  anneeFondation: { type: Number, default: null },

  // Chiffres clés (affichés en landing)
  chiffresEtAtouts: [
    {
      icone:  { type: String, default: '🏬' },    // emoji ou code icône
      valeur: { type: String, default: '' },       // ex: "120"
      label:  { type: String, default: '' },       // ex: "boutiques"
    }
  ],

  // Réseaux sociaux
  facebook:   { type: String, trim: true, default: '' },
  instagram:  { type: String, trim: true, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Centre', centreSchema);