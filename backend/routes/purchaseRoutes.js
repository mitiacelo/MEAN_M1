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

// GET /api/purchases → liste toutes les factures (ou filtrées par boutique)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopId = req.query.shopId; // si tu veux filtrer par boutique du manager
    const filter = shopId ? { 'items.product.id_shop': shopId } : {};
    const purchases = await Purchase.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name prix_actuel')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;