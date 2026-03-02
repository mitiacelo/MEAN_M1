const mongoose = require('mongoose');

const centreSchema = new mongoose.Schema({
  nom:       { type: String, required: true, trim: true },
  slogan:    { type: String, trim: true, default: '' },
  adresse:   { type: String, trim: true, default: '' },
  ville:     { type: String, trim: true, default: '' },
  telephone: { type: String, trim: true, default: '' },
  email:     { type: String, trim: true, default: '' },
  logo:      { type: String, default: '' }, // URL ou base64
}, { timestamps: true });

module.exports = mongoose.model('Centre', centreSchema);