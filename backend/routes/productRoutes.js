const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Type = require('../models/Type');
const Category = require('../models/Category');
const Domaine = require('../models/Domaine');
const Shop = require('../models/Shop');
const StockMouvement = require('../models/StockMouvement');
const PriceProduct = require('../models/PriceProduct');

// POST /api/products → Créer produit + stock initial + prix initial
router.post('/', async (req, res) => {
  console.log('POST /products - Body reçu :', req.body);

  try {
    const {
      name,
      description,
      id_type,
      id_shop,
      quantite = 0,
      prix
    } = req.body;

    if (!name || !id_type || !id_shop) {
      return res.status(400).json({ message: 'Nom, type et boutique obligatoires' });
    }

    if (quantite < 0) {
      return res.status(400).json({ message: 'Quantité ne peut pas être négative' });
    }

    if (prix == null || prix < 0) {
      return res.status(400).json({ message: 'Prix initial obligatoire et positif' });
    }

    const product = new Product({
      name,
      description: description || '',
      id_type,
      id_shop,
      quantite: Number(quantite)
    });

    await product.save();
    console.log('Produit créé → _id:', product._id);

    const mouvement = new StockMouvement({
      id_produit: product._id,
      type: 'entree',
      quantite: Number(quantite),
      stock_apres: Number(quantite)
    });

    await mouvement.save();

    const priceEntry = new PriceProduct({
      id_product: product._id,
      prix: Number(prix)
    });

    await priceEntry.save();

    // Populate léger pour la réponse
    const populated = await Product.findById(product._id)
      .populate('id_type', 'name');

    res.status(201).json({
      message: 'Produit créé avec succès',
      product: populated,
      mouvementInitial: mouvement,
      prixInitial: priceEntry
    });
  } catch (err) {
    console.error('Erreur création produit :', err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/products/shop/:shopId → tous les produits d'une boutique (avec prix actuel)
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

    // Ajouter prix actuel à chaque produit
    const productsWithPrice = await Promise.all(products.map(async (product) => {
      const lastPrice = await PriceProduct.findOne({ id_product: product._id }).sort({ createdAt: -1 });
      return {
        ...product.toObject(),
        prix_actuel: lastPrice ? lastPrice.prix : null
      };
    }));

    res.json(productsWithPrice);
  } catch (err) {
    console.error('ERREUR dans GET /products/shop/:shopId :');
    console.error(err.stack || err.message);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des produits',
      details: err.message || 'Erreur inconnue'
    });
  }
});

// GET /api/products/:id → détail d'un produit (avec prix actuel, historique prix et stock)
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

    // Prix actuel = dernier PriceProduct
    const lastPrice = await PriceProduct.findOne({ id_product: productId }).sort({ createdAt: -1 });
    const prixActuel = lastPrice ? lastPrice.prix : null;

    // Historique prix (tous les prix)
    const prixHistorique = await PriceProduct.find({ id_product: productId }).sort({ createdAt: -1 });

    // Historique stock (tous les mouvements)
    const stockHistorique = await StockMouvement.find({ id_produit: productId }).sort({ createdAt: -1 });

    console.log('→ Produit trouvé et populé');
    res.json({
      ...product.toObject(),
      prix_actuel: prixActuel,
      prix_historique: prixHistorique,
      stock_historique: stockHistorique
    });
  } catch (err) {
    console.error('ERREUR dans GET /products/:id :');
    console.error(err.stack || err.message);
    res.status(500).json({
      message: 'Erreur serveur',
      details: err.message
    });
  }
});

// PUT /api/products/:id → mise à jour complète (peut inclure quantite si besoin)
router.put('/:id', async (req, res) => {
  const productId = req.params.id;

  console.log(`PUT /products/${productId} - Body reçu :`, req.body);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'ID produit invalide' });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Erreur mise à jour produit :', err.message);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id → supprimer un produit
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

  console.log(`DELETE /products/${productId}`);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'ID produit invalide' });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression produit :', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;