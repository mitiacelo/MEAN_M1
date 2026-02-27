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

// POST /api/products → Créer un produit + stock initial + prix initial
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      id_type,
      id_boutique,
      quantite = 0,
      prix
    } = req.body;

    if (!name || !id_type || !id_boutique) {
      return res.status(400).json({ message: 'Nom, type et boutique obligatoires' });
    }

    const product = new Product({
      name,
      description: description || '',
      id_type,
      id_boutique,
      quantite: Number(quantite)
    });

    await product.save();

    // Stock initial
    if (quantite > 0) {
      await new StockMouvement({
        id_produit: product._id,
        type: 'entree',
        quantite: Number(quantite),
        stock_apres: Number(quantite)
      }).save();
    }

    // Prix initial
    await new PriceProduct({
      id_product: product._id,
      prix: Number(prix)
    }).save();

    const populated = await Product.findById(product._id).populate('id_type', 'name');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Erreur création produit :', err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/products/boutique/:boutiqueId → tous les produits d'une boutique (avec prix actuel)
router.get('/boutique/:boutiqueId', async (req, res) => {
  const boutiqueId = req.params.boutiqueId;

  console.log(`[GET] /products/boutique/${boutiqueId} - Requête reçue`);

  if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
    console.log('→ ID boutique invalide');
    return res.status(400).json({ message: 'ID de boutique invalide' });
  }

  try {
    const products = await Product.find({ id_boutique: boutiqueId })
      .populate({
        path: 'id_type',
        select: 'name id_category',
        populate: {
          path: 'id_category',
          select: 'name id_domaine',
          populate: { path: 'id_domaine', select: 'name' }
        }
      })
      .populate('id_boutique', 'name description');

    console.log(`→ ${products.length} produit(s) trouvé(s) pour boutique ${boutiqueId}`);

    // Ajouter le prix actuel à chaque produit
    const productsWithPrice = await Promise.all(products.map(async (product) => {
      const lastPrice = await PriceProduct.findOne({ id_product: product._id }).sort({ createdAt: -1 });
      return {
        ...product.toObject(),
        prix_actuel: lastPrice ? lastPrice.prix : null
      };
    }));

    res.json(productsWithPrice);
  } catch (err) {
    console.error('ERREUR GET /products/boutique/:boutiqueId :', err);
    res.status(500).json({ message: 'Erreur serveur', details: err.message });
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
      .populate('id_boutique', 'name description');  // ← corrigé : id_boutique au lieu de id_shop

    if (!product) {
      console.log('→ Produit non trouvé');
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Prix actuel = dernier PriceProduct
    const lastPrice = await PriceProduct.findOne({ id_product: productId }).sort({ createdAt: -1 });
    const prixActuel = lastPrice ? lastPrice.prix : null;

    // Historique prix
    const prixHistorique = await PriceProduct.find({ id_product: productId }).sort({ createdAt: -1 });

    // Historique stock
    const stockHistorique = await StockMouvement.find({ id_produit: productId }).sort({ createdAt: -1 });

    console.log('→ Produit trouvé et populé');
    res.json({
      ...product.toObject(),
      prix_actuel: prixActuel,
      prix_historique: prixHistorique,
      stock_historique: stockHistorique
    });
  } catch (err) {
    console.error('ERREUR GET /products/:id :', err);
    res.status(500).json({ message: 'Erreur serveur', details: err.message });
  }
});

// PUT /api/products/:id → mise à jour complète
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

// POST /api/products/import → Créer plusieurs produits en une fois
router.post('/import', async (req, res) => {
  try {
    const productsData = req.body;

    console.log('=== IMPORT BULK REÇU ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Nombre de produits reçus:', productsData?.length || 'undefined');

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({ message: 'Aucun produit valide envoyé' });
    }

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < productsData.length; i++) {
      const data = productsData[i];

      const {
        name,
        description = '',
        id_type,
        id_boutique,
        quantite = 0,
        prix
      } = data;

      if (!name || !id_type || !id_boutique || prix == null) {
        errors.push(`Produit ${i + 1} ignoré : champs obligatoires manquants`);
        continue;
      }

      try {
        const product = new Product({
          name,
          description,
          id_type,
          id_boutique,
          quantite: Number(quantite)
        });

        await product.save();

        if (Number(quantite) > 0) {
          await new StockMouvement({
            id_produit: product._id,
            type: 'entree',
            quantite: Number(quantite),
            stock_apres: Number(quantite)
          }).save();
        }

        await new PriceProduct({
          id_product: product._id,
          prix: Number(prix)
        }).save();

        createdProducts.push(product);
      } catch (err) {
        errors.push(`Produit ${i + 1} : ${err.message}`);
      }
    }

    if (createdProducts.length === 0) {
      return res.status(400).json({ message: 'Aucun produit créé', errors });
    }

    res.status(201).json({
      message: `${createdProducts.length} produit(s) créé(s)`,
      products: createdProducts,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('ERREUR IMPORT :', err);
    res.status(500).json({ message: 'Erreur serveur', details: err.message });
  }
});

module.exports = router;