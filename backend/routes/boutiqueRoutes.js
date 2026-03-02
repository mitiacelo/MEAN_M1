const express = require('express');
const router = express.Router();
const Boutique = require('../models/Boutique');
const Shop = require('../models/Shop');

// GET /api/boutiques/my-shop/:userId
router.get('/my-shop/:userId', async (req, res) => {
    try {
      const boutique = await Boutique.findOne({
        id_shop: { $in: await Shop.find({ id_user: req.params.userId }).distinct('_id') }
      })
        .populate('id_shop', 'name superficie status')
        .populate('id_domaine', 'name');  // ← ASSURE-TOI que c'est présent
  
      res.json(boutique || null);
    } catch (err) {
      console.error('Erreur GET /my-shop :', err.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

// GET /api/boutiques/all → Liste toutes les boutiques (publique)
router.get('/all', async (req, res) => {
    try {
      const boutiques = await Boutique.find()
        .populate('id_shop', 'name superficie status')
        .populate('id_domaine', 'name')
        .sort({ createdAt: -1 });
  
      res.json(boutiques);
    } catch (err) {
      console.error('Erreur GET /boutiques/all :', err.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  
  // GET /api/boutiques/:id → Détail d'une boutique (doit être APRÈS /all)
  router.get('/:id', async (req, res) => {
    try {
      const boutique = await Boutique.findById(req.params.id)
        .populate('id_shop', 'name superficie status')
        .populate('id_domaine', 'name');
  
      if (!boutique) {
        return res.status(404).json({ message: 'Boutique non trouvée' });
      }
  
      res.json(boutique);
    } catch (err) {
      console.error('Erreur GET /boutiques/:id :', err.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

// PUT /api/boutiques/:id → Modifier boutique
router.put('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('id_domaine', 'name');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    res.json(boutique);
  } catch (err) {
    console.error('Erreur PUT /boutiques/:id :', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
    try {
      const { name, description, id_shop, id_domaine } = req.body;
  
      console.log('POST /boutiques - Body reçu :', req.body);
  
      if (!name || !id_shop || !id_domaine) {
        return res.status(400).json({ message: 'Nom, id_shop et id_domaine obligatoires' });
      }
  
      const shop = await Shop.findById(id_shop);
      if (!shop) {
        return res.status(404).json({ message: 'Salle non trouvée' });
      }
  
      const existing = await Boutique.findOne({ id_shop });
      if (existing) {
        return res.status(400).json({ message: 'Cette salle a déjà une boutique' });
      }
  
      const boutique = new Boutique({
        name,
        description: description || '',
        id_shop,
        id_domaine
      });
  
      await boutique.save();
  
      // IMPORTANT : populate pour renvoyer les noms
      const populatedBoutique = await Boutique.findById(boutique._id)
        .populate('id_shop', 'name superficie status')
        .populate('id_domaine', 'name');
  
      res.status(201).json(populatedBoutique);
    } catch (err) {
      console.error('Erreur POST /boutiques :', err.message);
      res.status(400).json({ message: err.message });
    }
  });

  // GET /api/boutiques/user/:userId - Toutes les boutiques d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    // Trouve les shops (salles) de l'utilisateur
    const shops = await Shop.find({ id_user: req.params.userId }).select('_id');
    const shopIds = shops.map(s => s._id);

    // Trouve toutes les boutiques liées à ces shops
    const boutiques = await Boutique.find({ id_shop: { $in: shopIds } })
      .populate('id_shop', 'name superficie status')
      .populate('id_domaine', 'name')
      .sort({ createdAt: -1 });

    res.json(boutiques);
  } catch (err) {
    console.error('Erreur GET /boutiques/user/:userId :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;