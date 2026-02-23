const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Purchase = require('../models/Purchase');

// GET /api/purchases/:id → Récupérer une facture spécifique (pour l'utilisateur connecté)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product', 'name prix_actuel');

    if (!purchase) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json(purchase);
  } catch (err) {
    console.error('Erreur GET /purchases/:id :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Optionnel : GET /api/purchases → Liste toutes les factures de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id })
      .populate('items.product', 'name prix_actuel')
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    console.error('Erreur GET /purchases :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;