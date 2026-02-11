const express = require('express');
const router = express.Router();
const Block = require('../models/Block');

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