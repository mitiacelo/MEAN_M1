const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Boutique = require('../models/Boutique');
const Shop = require('../models/Shop');

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name quantite prix_actuel id_boutique');  // ← AJOUTE id_boutique ici !

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Votre panier est vide' });
    }

    let totalPrice = 0;
    const orderItems = [];

    // Récupère la boutique depuis le premier produit (ou gère multi-boutiques plus tard)
    let boutiqueId = null;
    if (cart.items.length > 0) {
      const firstItemProduct = cart.items[0].product;
      boutiqueId = firstItemProduct?.id_boutique;
    }

    for (const item of cart.items) {
      const product = item.product;
      if (product.quantite < item.quantity) {
        return res.status(400).json({ message: `Stock insuffisant pour ${product.name}` });
      }

      const price = item.priceAtAddition || product.prix_actuel || 0;
      totalPrice += price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: price
      });
    }

    const order = new Order({
      user: req.user.id,
      cart: cart._id,
      boutiqueId: boutiqueId,  // ← MAINTENANT C’EST BIEN DÉFINI
      items: orderItems,
      totalPrice,
      status: 'pending'
    });

    await order.save();

    // Vider le panier
    cart.items = [];
    await cart.save();

    // Décrémenter stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantite: -item.quantity }
      });
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      orderId: order._id
    });
  } catch (err) {
    console.error('Erreur création commande :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/orders → Liste des commandes de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name prix_actuel')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/orders/:id/finalize → Finaliser (créer Purchase + changer statut Order)
router.post('/:id/finalize', authMiddleware, async (req, res) => {
    const { deliveryAddress } = req.body; // { city, district, address, phone }
  
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id,
        status: 'pending'
      }).populate('items.product');
  
      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée ou déjà traitée' });
      }
  
      const totalProducts = order.totalPrice;
      const deliveryFee = 5000;
      const grandTotal = totalProducts + deliveryFee;
  
      const purchase = new Purchase({
        user: req.user.id,
        order: order._id,
        items: order.items,
        totalProducts,
        deliveryFee,
        grandTotal,
        deliveryAddress,
        status: 'pending_payment'
      });
  
      await purchase.save();
  
      // Mettre la commande en "confirmed" ou "archived"
      order.status = 'confirmed';
      await order.save();
  
      res.status(201).json({
        message: 'Commande finalisée',
        purchaseId: purchase._id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  
  // POST /api/orders/:id/cancel
  router.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id, status: 'pending' },
        { status: 'cancelled' },
        { new: true }
      );
  
      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée ou non annulable' });
      }
  
      res.json({ message: 'Commande annulée', order });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id
      }).populate('items.product', 'name prix_actuel');
  
      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }
  
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  router.get('/user/:userId', async (req, res) => {
    try {
      console.log(`[ORDERS] Requête pour manager: ${req.params.userId}`);
  
      // Trouve les shops du manager
      const shops = await Shop.find({ id_user: req.params.userId }).distinct('_id');
      console.log(`[ORDERS] Shops du manager : ${shops.length}`, shops);
  
      if (shops.length === 0) {
        console.log('[ORDERS] Pas de shop → renvoie vide');
        return res.json([]);
      }
  
      // Trouve les boutiques de ces shops
      const boutiques = await Boutique.find({ id_shop: { $in: shops } }).distinct('_id');
      console.log(`[ORDERS] Boutiques trouvées : ${boutiques.length}`, boutiques);
  
      if (boutiques.length === 0) {
        console.log('[ORDERS] Pas de boutique → renvoie vide');
        return res.json([]);
      }
  
      // Trouve les commandes de ces boutiques
      const orders = await Order.find({ boutiqueId: { $in: boutiques } })
        .populate('items.product', 'name prix_actuel')
        .sort({ createdAt: -1 });
  
      console.log(`[ORDERS] Commandes trouvées : ${orders.length}`);
      if (orders.length > 0) {
        console.log('[ORDERS] Détail première commande :', {
          id: orders[0]._id,
          boutiqueId: orders[0].boutiqueId,
          totalPrice: orders[0].totalPrice,
          status: orders[0].status,
          createdAt: orders[0].createdAt
        });
      }
  
      res.json(orders);
    } catch (err) {
      console.error('[ORDERS] Erreur route /user/:userId :', err);
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });

module.exports = router;