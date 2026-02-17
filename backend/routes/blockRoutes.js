const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const Shop = require('../models/Shop'); // ✅ import Shop pour récupérer sa couleur

// Récupérer tous les blocs d'une grille
router.get('/grille/:grilleId', async (req, res) => {
  try {
    const blocks = await Block.find({ grilleId: req.params.grilleId })
      .sort({ ligne: 1, colonne: 1 });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer plusieurs blocs en une fois
router.post('/bulk', async (req, res) => {
  try {
    const blocks = await Block.insertMany(req.body);
    res.status(201).json(blocks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer tous les blocs d'une grille
router.delete('/grille/:grilleId', async (req, res) => {
  try {
    await Block.deleteMany({ grilleId: req.params.grilleId });
    res.json({ message: "Blocs supprimés" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Associer plusieurs blocs à un shop + appliquer la couleur du shop
router.put('/assign-shop', async (req, res) => {
  const { blockIds, shopId } = req.body;

  if (!blockIds || !shopId) {
    return res.status(400).json({ message: "blockIds et shopId obligatoires" });
  }

  try {
    // 🔒 Vérifier si certains blocs sont déjà assignés
    const blocsDejaAssignes = await Block.find({
      blockId: { $in: blockIds },
      shopId: { $ne: null }
    });

    if (blocsDejaAssignes.length > 0) {
      const ids = blocsDejaAssignes.map(b => b.blockId).join(', ');
      return res.status(400).json({ 
        message: `Blocs déjà assignés : ${ids}` 
      });
    }

    // ✅ Récupérer la couleur du shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop introuvable" });
    }

    const color = shop.color;

    // ✅ Assigner shopId + color aux blocs
    await Block.updateMany(
      { blockId: { $in: blockIds } },
      { $set: { shopId, color } }
    );

    res.json({ message: "Blocs assignés au shop ✅", color });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour un bloc
router.put('/:id', async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(block);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;