const express = require('express');
const router = express.Router();
const Loyer = require('../models/Loyer');
const Contract = require('../models/Contract');

// ── GET /loyers/dashboard → vue admin : tous les locataires + statut mois en cours
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const moisCourant = now.getMonth() + 1;
    const anneeCourante = now.getFullYear();

    // Récupérer tous les contrats actifs
    const contracts = await Contract.find({ statut: 'actif' })
      .populate('user', 'name firstname email')
      .populate('shop', 'name superficie');

    // Pour chaque contrat, trouver ou créer le loyer du mois courant
    const result = await Promise.all(contracts.map(async (contract) => {
      let loyerMois = await Loyer.findOne({
        contract: contract._id,
        mois: moisCourant,
        annee: anneeCourante
      });

      // Si pas encore créé, on le crée automatiquement en "en_attente"
      if (!loyerMois) {
        loyerMois = await Loyer.create({
          contract: contract._id,
          shop: contract.shop._id,
          user: contract.user._id,
          mois: moisCourant,
          annee: anneeCourante,
          montant: contract.loyer + contract.charges,
          loyer: contract.loyer,
          charges: contract.charges,
          statut: 'en_attente'
        });
      }

      // Vérifier si en retard (après le 5 du mois et pas payé)
      const jourLimite = new Date(anneeCourante, moisCourant - 1, 5);
      if (loyerMois.statut === 'en_attente' && now > jourLimite) {
        loyerMois.statut = 'en_retard';
        await loyerMois.save();
      }

      return {
        contract,
        loyerMois
      };
    }));

    // Trier : en_retard en premier, puis en_attente, puis payé
    result.sort((a, b) => {
      const ordre = { en_retard: 0, en_attente: 1, payé: 2 };
      return ordre[a.loyerMois.statut] - ordre[b.loyerMois.statut];
    });

    res.json(result);
  } catch (err) {
    console.error('Erreur dashboard loyers:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /loyers/historique/:contractId → historique d'un contrat
router.get('/historique/:contractId', async (req, res) => {
  try {
    const loyers = await Loyer.find({ contract: req.params.contractId })
      .sort({ annee: -1, mois: -1 });
    res.json(loyers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /loyers/:id/payer → admin confirme le paiement
router.patch('/:id/payer', async (req, res) => {
  try {
    const { note } = req.body;
    const loyer = await Loyer.findByIdAndUpdate(
      req.params.id,
      {
        statut: 'payé',
        datePaiement: new Date(),
        note: note || ''
      },
      { new: true }
    );
    if (!loyer) return res.status(404).json({ message: 'Loyer non trouvé' });
    res.json(loyer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /loyers/:id/annuler-paiement → annuler un paiement confirmé par erreur
router.patch('/:id/annuler-paiement', async (req, res) => {
  try {
    const loyer = await Loyer.findByIdAndUpdate(
      req.params.id,
      { statut: 'en_attente', datePaiement: null, note: '' },
      { new: true }
    );
    if (!loyer) return res.status(404).json({ message: 'Loyer non trouvé' });
    res.json(loyer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;