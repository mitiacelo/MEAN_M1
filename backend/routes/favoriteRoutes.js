const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const Boutique = require('../models/Boutique');

// POST /api/favorites → ajouter un produit en favori
router.post('/', authMiddleware, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'ID produit requis' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    const boutique = await Boutique.findOne({ _id: product.id_boutique });
    if (!boutique) return res.status(404).json({ message: 'Boutique du produit non trouvée' });

    // Vérifie si déjà en favori
    const existing = await Favorite.findOne({ user: req.user.id, product: productId });
    if (existing) {
      return res.status(400).json({ message: 'Produit déjà en favori' });
    }

    const favorite = new Favorite({
      user: req.user.id,
      product: productId,
      boutique: product.id_boutique
    });

    await favorite.save();

    res.status(201).json({ message: 'Ajouté aux favoris', favorite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/favorites/:productId → supprimer un favori
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      product: req.params.productId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }

    res.json({ message: 'Retiré des favoris' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/favorites → liste des favoris de l'utilisateur connecté
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('product', 'name description prix_actuel quantite id_type')
      .populate('boutique', 'name id_shop')
      .sort({ addedAt: -1 });

    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;