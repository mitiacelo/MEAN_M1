const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Charge tous les modèles référencés dans les populate
const Type     = require('../models/Type');
const Category = require('../models/Category');
const Domaine  = require('../models/Domaine');

// GET /api/products/shop/:shopId → tous les produits d'une boutique
router.get('/shop/:shopId', async (req, res) => {
  const shopId = req.params.shopId;

  console.log(`[GET] /products/shop/${shopId} - Requête reçue`);

  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    console.log('→ ID boutique invalide');
    return res.status(400).json({ message: 'ID de boutique invalide' });
  }

  try {
    console.log('→ Recherche des produits...');

    const products = await Product.find({ id_shop: shopId })
      .populate({
        path: 'id_type',
        select: 'name id_category',
        populate: {
          path: 'id_category',
          select: 'name id_domaine',
          populate: { path: 'id_domaine', select: 'name' }
        }
      })
      .populate('id_shop', 'name description superficie status');

    console.log(`→ ${products.length} produit(s) trouvé(s)`);

    res.json(products);
  } catch (err) {
    console.error('ERREUR dans GET /products/shop/:shopId :');
    console.error(err.stack || err.message);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des produits',
      details: err.message || 'Erreur inconnue'
    });
  }
});

// GET /api/products/:id → détail d'un produit
router.get('/:id', async (req, res) => {
  const productId = req.params.id;

  console.log(`[GET] /products/${productId} - Requête reçue`);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.log('→ ID produit invalide');
    return res.status(400).json({ message: 'ID produit invalide' });
  }

  try {
    const product = await Product.findById(productId)
      .populate({
        path: 'id_type',
        select: 'name id_category',
        populate: {
          path: 'id_category',
          select: 'name id_domaine',
          populate: { path: 'id_domaine', select: 'name' }
        }
      })
      .populate('id_shop', 'name description');

    if (!product) {
      console.log('→ Produit non trouvé');
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    console.log('→ Produit trouvé et populé');
    res.json(product);
  } catch (err) {
    console.error('ERREUR dans GET /products/:id :');
    console.error(err.stack || err.message);
    res.status(500).json({
      message: 'Erreur serveur',
      details: err.message
    });
  }
});

module.exports = router;