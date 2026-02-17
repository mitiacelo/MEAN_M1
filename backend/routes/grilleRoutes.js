const express = require('express');
const router = express.Router();
const Grille = require('../models/Grille');
const Block = require('../models/Block');
const Shop = require('../models/Shop');

// Récupérer LA grille unique (s'il y en a une)
router.get('/', async (req, res) => {
  try {
    const grille = await Grille.findOne(); // Récupère la première (et unique) grille
    res.json(grille);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer OU mettre à jour la grille unique
router.post('/', async (req, res) => {
  try {
    let grille = await Grille.findOne();
    
    if (grille) {
      // Si une grille existe déjà, on la met à jour
      grille.lignes = req.body.lignes;
      grille.colonnes = req.body.colonnes;
      await grille.save();
      
      res.json({ ...grille.toObject(), isUpdate: true });
    } else {
      // Sinon, on crée une nouvelle grille
      grille = new Grille(req.body);
      await grille.save();
      res.status(201).json({ ...grille.toObject(), isUpdate: false });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer la grille ET tous ses blocs
router.delete('/', async (req, res) => {
  try {
    const grille = await Grille.findOne();
    if (grille) {
      await Block.deleteMany({ grilleId: grille._id });
      await Grille.deleteOne({ _id: grille._id });
    }
    res.json({ message: "Grille et blocs supprimés" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;