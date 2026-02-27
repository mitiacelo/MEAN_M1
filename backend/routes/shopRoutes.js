const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
function genererCouleurPastel() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 20) + 40; // 40-60%
  const l = Math.floor(Math.random() * 10) + 80; // 80-90%
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ✅ POST /api/shops → créer une boutique
router.post('/', async (req, res) => {
  try {
    const newShop = new Shop({
      ...req.body,
      color: genererCouleurPastel() // ✅ couleur générée ici
    });
    await newShop.save();
    res.status(201).json(newShop);
  } catch (err) {
    console.error('Erreur création boutique:', err);
    res.status(400).json({ message: 'Erreur création boutique', error: err.message });
  }
});

// ✅ GET /api/shops → récupérer toutes les boutiques
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find().populate('id_user', 'name firstname email');
    res.json(shops);
  } catch (err) {
    console.error('Erreur récupération boutiques:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ GET /api/shops/available → boutiques inactives (disponibles)
router.get('/available', async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'inactif' })
      .select('name description superficie status')
      .populate('id_user', 'name firstname email');
    res.json(shops);
  } catch (err) {
    console.error('Erreur récupération boutiques disponibles:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ GET /api/shops/active → boutiques actives (louées ou ouvertes)
router.get('/active', async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'actif' })
      .select('name description superficie status')
      .populate('id_user', 'name firstname email');
    res.json(shops);
  } catch (err) {
    console.error('Erreur récupération boutiques actives:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ GET /api/shops/:id → détail d’une boutique
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('id_user', 'name firstname email');

    if (!shop) return res.status(404).json({ message: 'Boutique non trouvée' });

    res.json(shop);
  } catch (err) {
    console.error('Erreur récupération boutique:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ PUT /api/shops/:id → mettre à jour une boutique
router.put('/:id', async (req, res) => {
  try {
    const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedShop) return res.status(404).json({ message: 'Boutique non trouvée' });
    res.json(updatedShop);
  } catch (err) {
    console.error('Erreur mise à jour boutique:', err);
    res.status(400).json({ message: 'Erreur mise à jour boutique', error: err.message });
  }
});

// ✅ DELETE /api/shops/:id → supprimer une boutique
router.delete('/:id', async (req, res) => {
  try {
    const deletedShop = await Shop.findByIdAndDelete(req.params.id);
    if (!deletedShop) return res.status(404).json({ message: 'Boutique non trouvée' });
    res.json({ message: 'Boutique supprimée', shop: deletedShop });
  } catch (err) {
    console.error('Erreur suppression boutique:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!shop) return res.status(404).json({ message: 'Boutique non trouvée' });

    res.json(shop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const shops = await Shop.find({ id_user: req.params.userId })
      .sort({ createdAt: -1 })
      .select('name superficie status id_user');

    if (!shops || shops.length === 0) {
      return res.status(200).json([]); // tableau vide si aucune salle
    }

    res.json(shops);
  } catch (err) {
    console.error('Erreur GET /shops/user/:userId :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;