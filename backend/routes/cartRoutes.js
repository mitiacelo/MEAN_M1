const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // ← importe-le ici
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/cart → nécessite connexion
router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  console.log('POST /cart - Body reçu :', req.body);

  if (!productId) {
    return res.status(400).json({ message: 'ID produit requis' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    if (product.quantite < quantity) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    const userId = req.user.id; // ← maintenant défini par middleware

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: product.prix_actuel || 0
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name quantite prix_actuel');

    res.status(201).json(updatedCart);
  } catch (err) {
    console.error('Erreur POST /cart :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:productId', authMiddleware, async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantité invalide' });
    }
  
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        return res.status(404).json({ message: 'Panier non trouvé' });
      }
  
      const item = cart.items.find(i => i.product.toString() === req.params.productId);
      if (!item) {
        return res.status(404).json({ message: 'Article non trouvé dans le panier' });
      }
  
      item.quantity = quantity;
      await cart.save();
  
      const updated = await Cart.findById(cart._id).populate('items.product', 'name quantite prix_actuel');
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  router.get('/', authMiddleware, async (req, res) => {
    try {
      let cart = await Cart.findOne({ user: req.user.id })
        .populate({
          path: 'items.product',
          select: 'name description quantite prix_actuel id_type',
          populate: { path: 'id_type', select: 'name' }
        });
  
      if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] });
        await cart.save();
      }
  
      res.json(cart);
    } catch (err) {
      console.error('Erreur GET /cart :', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

module.exports = router;