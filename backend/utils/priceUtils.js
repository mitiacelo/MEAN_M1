const PriceProduct = require('../models/PriceProduct');
const Promotion = require('../models/Promotion');

async function getFinalPrice(productId) {

  // 1️⃣ Récupérer le dernier prix
  const lastPrice = await PriceProduct
    .findOne({ id_product: productId })
    .sort({ createdAt: -1 });

  if (!lastPrice) return null;

  const prixActuel = lastPrice.prix;

  // 2️⃣ Chercher une promotion active
  const promotion = await Promotion.findOne({
    product: productId,
    isActive: true
  }).sort({ createdAt: -1 });

  if (!promotion) return prixActuel;

  const now = new Date();

  const isValidDate =
    (!promotion.startDate || promotion.startDate <= now) &&
    (!promotion.endDate || promotion.endDate >= now);

  if (!isValidDate) return prixActuel;

  let finalPrice = prixActuel;

  if (promotion.discountType === 'percentage') {
    finalPrice = prixActuel - (prixActuel * promotion.discountValue / 100);
  }

  if (promotion.discountType === 'fixed') {
    finalPrice = prixActuel - promotion.discountValue;
  }

  // Sécurité : éviter prix négatif
  return finalPrice < 0 ? 0 : finalPrice;
}

module.exports = { getFinalPrice };