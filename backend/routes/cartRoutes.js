const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const PriceProduct = require('../models/PriceProduct');

// POST /api/cart → ajouter au panier de l'utilisateur connecté
router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) return res.status(400).json({ message: 'ID produit requis' });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    if (product.quantite < quantity) return res.status(400).json({ message: 'Stock insuffisant' });

    const lastPrice = await PriceProduct.findOne({ id_product: productId })
      .sort({ createdAt: -1 })
      .select('prix');

    const currentPrice = lastPrice ? lastPrice.prix : 0;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: currentPrice
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name description quantite prix_actuel id_type',
        populate: { path: 'id_type', select: 'name' }
      });

    res.status(201).json(updatedCart);
  } catch (err) {
    console.error('Erreur POST /cart :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/cart/:productId → modifier quantité
router.put('/:productId', authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Quantité invalide' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Panier non trouvé' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Article non trouvé dans le panier' });

    item.quantity = quantity;
    await cart.save();

    const updated = await Cart.findById(cart._id).populate('items.product', 'name quantite prix_actuel');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/cart → panier de l'utilisateur connecté
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

// GET /api/carts → liste TOUS les paniers (pour manager boutique)
router.get('/carts', authMiddleware, async (req, res) => {
  try {
    // const shopId = req.user.id_shop;
    // if (!shopId) {
    //   return res.status(403).json({ message: 'Accès réservé aux managers de boutique' });
    // }

    // Option 1 : tout afficher (test)
    const carts = await Cart.find()
      .populate('user', 'name firstname email')
      .populate('items.product', 'name prix_actuel')
      .sort({ updatedAt: -1 });

    res.json(carts);

    // Option 2 : filtrer par boutique si id_shop existe (plus tard)
    // const carts = await Cart.find({
    //   'items.product.id_shop': shopId
    // }) ...
  } catch (err) {
    console.error('Erreur GET /carts :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/cart/:productId → supprimer un article du panier
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Filtre les items pour supprimer celui avec le productId
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    await cart.save();

    // Retourne le panier mis à jour (avec populate pour le frontend)
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name description quantite prix_actuel id_type',
        populate: { path: 'id_type', select: 'name' }
      });

    res.json(updatedCart);
  } catch (err) {
    console.error('Erreur DELETE /cart/:productId :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;