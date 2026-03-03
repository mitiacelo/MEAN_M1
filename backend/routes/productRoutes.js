// productRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');

const Product = require('../models/Product');
const Type = require('../models/Type');
const Category = require('../models/Category');
const Domaine = require('../models/Domaine');
const Shop = require('../models/Shop');
const StockMouvement = require('../models/StockMouvement');
const PriceProduct = require('../models/PriceProduct');
const cloudinary = require('../config/cloudinary');
const Promotion = require('../models/Promotion');

// Multer temporaire pour stocker localement avant upload Cloudinary
const upload = multer({ dest: 'uploads/' });

// ------------------ CREATE PRODUCT ------------------
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, id_type, id_boutique, quantite = 0, prix } = req.body;

    if (!name || !id_type || !id_boutique) {
      return res.status(400).json({ message: 'Nom, type et boutique obligatoires' });
    }

    // Upload images sur Cloudinary
    const imageUrls = [];
    if (req.files) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'products' });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path); // supprimer le fichier temporaire
      }
    }

    const product = new Product({
      name,
      description: description || '',
      id_type,
      id_boutique,
      quantite: Number(quantite),
      images: imageUrls
    });

    await product.save();

    // Stock initial et prix
    if (quantite > 0) {
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

    const populated = await Product.findById(product._id).populate('id_type', 'name');
    res.status(201).json(populated);

  } catch (err) {
    console.error('Erreur création produit :', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ------------------ GET PRODUCTS BY BOUTIQUE ------------------
// router.get('/boutique/:boutiqueId', async (req, res) => {
//   const boutiqueId = req.params.boutiqueId;

//   if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
//     return res.status(400).json({ message: 'ID de boutique invalide' });
//   }

//   try {
//     const products = await Product.find({ id_boutique: boutiqueId })
//       .populate({
//         path: 'id_type',
//         select: 'name id_category',
//         populate: {
//           path: 'id_category',
//           select: 'name id_domaine',
//           populate: { path: 'id_domaine', select: 'name' }
//         }
//       })
//       .populate('id_boutique', 'name description');

//     // Ajouter le prix actuel à chaque produit
//     const productsWithPrice = await Promise.all(products.map(async (product) => {
//       const lastPrice = await PriceProduct.findOne({ id_product: product._id }).sort({ createdAt: -1 });
//       return {
//         ...product.toObject(),
//         prix_actuel: lastPrice ? lastPrice.prix : null
//       };
//     }));

//     res.json(productsWithPrice);
//   } catch (err) {
//     console.error('ERREUR GET /products/boutique/:boutiqueId :', err);
//     res.status(500).json({ message: 'Erreur serveur', details: err.message });
//   }
// });

// ------------------ GET PRODUCT DETAIL ------------------
router.get('/:id', async (req, res) => {
  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
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
      .populate('id_boutique', 'name description');

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const lastPrice = await PriceProduct.findOne({ id_product: productId }).sort({ createdAt: -1 });
    const prixActuel = lastPrice ? lastPrice.prix : null;

    const prixHistorique = await PriceProduct.find({ id_product: productId }).sort({ createdAt: -1 });
    const stockHistorique = await StockMouvement.find({ id_produit: productId }).sort({ createdAt: -1 });

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

// ------------------ UPDATE PRODUCT ------------------
router.put('/:id', async (req, res) => {
  const productId = req.params.id;

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

// ------------------ DELETE PRODUCT ------------------
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

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

// ------------------ BULK IMPORT ------------------
router.post('/import', async (req, res) => {
  try {
    const productsData = req.body;

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({ message: 'Aucun produit valide envoyé' });
    }

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < productsData.length; i++) {
      const data = productsData[i];
      const { name, description = '', id_type, id_boutique, quantite = 0, prix } = data;

      if (!name || !id_type || !id_boutique || prix == null) {
        errors.push(`Produit ${i + 1} ignoré : champs obligatoires manquants`);
        continue;
      }

      try {
        const product = new Product({ name, description, id_type, id_boutique, quantite: Number(quantite) });
        await product.save();

        if (Number(quantite) > 0) {
          await new StockMouvement({
            id_produit: product._id,
            type: 'entree',
            quantite: Number(quantite),
            stock_apres: Number(quantite)
          }).save();
        }

        await new PriceProduct({ id_product: product._id, prix: Number(prix) }).save();
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

// ------------------ GET PRODUCTS BY BOUTIQUE AVEC PROMOTION ------------------
router.get('/boutique/:boutiqueId', async (req, res) => {
  const boutiqueId = req.params.boutiqueId;

  if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
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

    const now = new Date();

    const productsWithPromo = await Promise.all(
      products.map(async (product) => {

        // 🔹 Prix actuel
        const lastPrice = await PriceProduct
          .findOne({ id_product: product._id })
          .sort({ createdAt: -1 });

        const prixActuel = lastPrice ? lastPrice.prix : null;

        // 🔹 Chercher promo ACTIVE et valide en date
        const promotion = await Promotion.findOne({
          product: product._id,
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now }
        });

        let promoPrice = prixActuel;
        let promoData = null;

        if (promotion && prixActuel != null) {

          if (promotion.discountType === 'percentage') {
            promoPrice = prixActuel - (prixActuel * promotion.discountValue / 100);
          }

          if (promotion.discountType === 'fixed') {
            promoPrice = prixActuel - promotion.discountValue;
          }

          promoData = {
            discountType: promotion.discountType,
            discountValue: promotion.discountValue
          };
        }

        return {
          ...product.toObject(),
          prix_actuel: prixActuel,
          promoPrice,
          promotion: promoData,
          mainImage: product.images?.[0] || '',
          hasPromotion: promoData !== null
        };
      })
    );

    res.json(productsWithPromo);

  } catch (err) {
    console.error('ERREUR GET /products/boutique/:boutiqueId :', err);
    res.status(500).json({ message: 'Erreur serveur', details: err.message });
  }
});

module.exports = router;