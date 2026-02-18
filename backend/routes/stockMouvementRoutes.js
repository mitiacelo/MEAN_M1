const express = require('express');
const router = express.Router();
const StockMouvement = require('../models/StockMouvement');

// POST – Ajouter un mouvement de stock (entrée ou sortie)
router.post('/', async (req, res) => {
  try {
    const mouvement = new StockMouvement(req.body);
    await mouvement.save();

    // Optionnel : mettre à jour le stock actuel du produit
    const product = await Product.findById(req.body.id_produit);
    if (product) {
      if (req.body.type === 'entree') {
        product.quantite += req.body.quantite;
      } else {
        product.quantite -= req.body.quantite;
      }
      product.quantite = Math.max(0, product.quantite); // pas de stock négatif
      await product.save();
    }

    res.status(201).json(mouvement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET – Historique d’un produit
router.get('/product/:productId', async (req, res) => {
  try {
    const mouvements = await StockMouvement.find({ id_produit: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(mouvements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;