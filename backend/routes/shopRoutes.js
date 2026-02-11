const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// GET /api/shops/available → boutiques inactives (disponibles à la location)
router.get('/available', async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'inactif' })
      .select('name description superficie status')
      .populate('id_user', 'name firstname email'); // infos du propriétaire si besoin

    res.json(shops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/shops/active → boutiques actives (déjà louées / ouvertes)
router.get('/active', async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'actif' })
      .select('name description superficie status')
      .populate('id_user', 'name firstname');

    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/shops/:id → détail d'une boutique (publique)
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .select('name description superficie status id_user createdAt')
      .populate('id_user', 'name firstname email');

    if (!shop) return res.status(404).json({ message: 'Boutique non trouvée' });

    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;