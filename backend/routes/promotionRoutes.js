const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');

router.post('/product', async (req, res) => {
  try {
    console.log("Création promo, req.body :", req.body); // ✅ affiche tout ce que Angular envoie
    const { product, discountType, discountValue, startDate, endDate } = req.body;
    const productId = product; // on renomme juste pour la suite du code
    console.log("productId reçu :", productId);
    console.log("discountType :", discountType);
    console.log("discountValue :", discountValue);
    console.log("startDate :", startDate);
    console.log("endDate :", endDate);

    if (!productId || !discountType || discountValue == null) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const Product = require('../models/Product');
    const prod = await Product.findById(productId);
    if (!prod) return res.status(400).json({ message: 'Produit introuvable' });

    await Promotion.updateMany(
      { product: productId, isActive: true },
      { isActive: false }
    );

    const newPromo = new Promotion({
      product: productId,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive: true
    });

    await newPromo.save();

    res.status(201).json(newPromo);
  } catch (error) {
    console.error("Erreur création promo :", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
    const promotions = await Promotion.find().populate('product');
    res.json(promotions);
  });

module.exports = router;