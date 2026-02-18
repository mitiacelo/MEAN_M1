const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  phone: {
    type: String,
    required: [true, "Le numéro de téléphone est obligatoire"]
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"]
  },
  message: {
    type: String,
    required: [true, "Veuillez décrire votre demande"]
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);