// models/Maintenance.js
const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({

  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },

  // Qui a signalé (peut être un manager/locataire ou l'admin lui-même)
  signalePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  titre: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  // Catégorie du problème
  categorie: {
    type: String,
    enum: ['électricité', 'plomberie', 'structure', 'climatisation', 'sécurité', 'nettoyage', 'autre'],
    default: 'autre'
  },

  priorite: {
    type: String,
    enum: ['urgent', 'normal', 'faible'],
    default: 'normal'
  },

  statut: {
    type: String,
    enum: ['ouvert', 'en_cours', 'résolu', 'annulé'],
    default: 'ouvert'
  },

  // Note de résolution ajoutée par l'admin
  noteResolution: {
    type: String,
    default: ''
  },

  // Date à laquelle l'admin planifie l'intervention
  dateIntervention: {
    type: Date,
    default: null
  },

  dateResolution: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);