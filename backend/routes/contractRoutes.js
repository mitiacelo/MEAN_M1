const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Contract = require('../models/Contract');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { genererContratPDF } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');

// ── POST /contracts → créer un contrat (brouillon) ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const { shopId, userId, loyer, charges, dateDebut, dateFin, dureeContrat, clauses, depot } = req.body;

    const contract = new Contract({
      shop: shopId,
      user: userId,
      loyer,
      charges: charges || 0,
      dateDebut,
      dateFin,
      dureeContrat,
      clauses,
      depot: depot || 0,
      statut: 'brouillon'
    });

    await contract.save();
    res.status(201).json(contract);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── GET /contracts/shop/:shopId → contrat d'une boutique ────────────────────
router.get('/shop/:shopId', async (req, res) => {
  try {
    const contract = await Contract.findOne({ shop: req.params.shopId })
      .populate('user', 'name firstname email phone')
      .populate('shop', 'name superficie description')
      .sort({ createdAt: -1 });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /contracts/user/:userId → contrats du locataire ─────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const contracts = await Contract.find({ user: req.params.userId })
      .populate('shop', 'name superficie description')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /contracts/:id → détail d'un contrat ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('user', 'name firstname email phone')
      .populate('shop', 'name superficie description');
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /contracts/:id → modifier un contrat (brouillon seulement) ──────────
router.put('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.statut !== 'brouillon') {
      return res.status(400).json({ message: 'Impossible de modifier un contrat déjà signé' });
    }

    Object.assign(contract, req.body);
    await contract.save();
    res.json(contract);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── POST /contracts/:id/signer-admin → admin signe le contrat ───────────────
router.post('/:id/signer-admin', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('user', 'name firstname email phone')
      .populate('shop', 'name superficie description');

    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.statut !== 'brouillon') {
      return res.status(400).json({ message: 'Contrat déjà signé' });
    }

    // Générer token de signature client
    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    contract.statut = 'signé_admin';
    contract.dateSignatureAdmin = new Date();
    contract.tokenSignature = token;
    contract.tokenExpire = expire;
    await contract.save();

    // Générer le PDF
    const pdfBuffer = await genererContratPDF({
      contract,
      shop: contract.shop,
      user: contract.user,
      centre: { nom: 'Centre Commercial' }
    });

    // Lien de signature client
    const lienSignature = `${process.env.FRONTEND_URL}/contrat/signer/${token}`;

    // Envoyer email au client avec le PDF en pièce jointe
    await sendEmail({
      to: contract.user.email,
      subject: `Votre contrat de bail — ${contract.shop.name}`,
      body: `Bonjour ${contract.user.firstname},\n\nVotre contrat pour "${contract.shop.name}" est prêt à signer.\n\nLien : ${lienSignature}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px">
          <h2 style="color:#c07a3a">Votre contrat de bail</h2>
          <p>Bonjour <strong>${contract.user.firstname}</strong>,</p>
          <p>Votre contrat pour la boutique <strong>${contract.shop.name}</strong> est prêt.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${lienSignature}"
               style="background:#c07a3a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
              ✍️ Signer mon contrat
            </a>
          </div>
          <p style="color:#888;font-size:12px">Lien direct : <a href="${lienSignature}">${lienSignature}</a></p>
          <p style="color:#888;font-size:12px">Valable 7 jours. Le contrat PDF est en pièce jointe.</p>
        </div>
      `,
      signature: `Administration — Centre Commercial`,
      attachments: [{
        filename: `contrat-${contract.shop.name}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    res.json({ message: 'Contrat signé par l\'admin et envoyé au client', contract });
  } catch (err) {
    console.error('Erreur signature admin:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /contracts/signer-client/:token → client signe via lien email ──────
router.post('/signer-client/:token', async (req, res) => {
  try {
    const contract = await Contract.findOne({ tokenSignature: req.params.token })
      .populate('user', 'name firstname email')
      .populate('shop', 'name');

    if (!contract) return res.status(404).json({ message: 'Lien invalide ou expiré' });
    if (contract.tokenExpire < new Date()) {
      return res.status(400).json({ message: 'Ce lien de signature a expiré' });
    }
    if (contract.statut === 'actif' || contract.statut === 'signé_client') {
      return res.status(400).json({ message: 'Contrat déjà signé' });
    }

    await _activerContrat(contract);
    res.json({ message: 'Contrat signé avec succès', contract });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /contracts/:id/signer-client-app → client signe depuis l'app ───────
router.post('/:id/signer-client-app', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('user', 'name firstname email')
      .populate('shop', 'name');

    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.statut !== 'signé_admin') {
      return res.status(400).json({ message: 'Le contrat doit d\'abord être signé par l\'admin' });
    }

    await _activerContrat(contract);
    res.json({ message: 'Contrat activé', contract });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /contracts/:id/pdf → télécharger le PDF du contrat ──────────────────
router.get('/:id/pdf', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('user', 'name firstname email phone')
      .populate('shop', 'name superficie description');

    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });

    const pdfBuffer = await genererContratPDF({
      contract,
      shop: contract.shop,
      user: contract.user,
      centre: { nom: 'Centre Commercial' }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="contrat-${contract.shop.name}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /contracts/:id/resilier → résilier un contrat actif ────────────────
router.post('/:id/resilier', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('shop')
      .populate('user');

    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });

    contract.statut = 'résilié';
    await contract.save();

    // Remettre la boutique en inactif et le user en rôle user
    await Shop.findByIdAndUpdate(contract.shop._id, { status: 'inactif', id_user: null });
    await User.findByIdAndUpdate(contract.user._id, { role: 'user', id_shop: null });

    res.json({ message: 'Contrat résilié', contract });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Fonction interne : activer le contrat + passer user en manager ───────────
async function _activerContrat(contract) {
  contract.statut = 'actif';
  contract.dateSignatureClient = new Date();
  contract.tokenSignature = undefined;
  contract.tokenExpire = undefined;
  await contract.save();

  // Passer le user en manager et lui assigner la boutique
  await User.findByIdAndUpdate(contract.user._id, {
    role: 'manager',
    id_shop: contract.shop._id
  });

  // Passer la boutique en actif et lui assigner le user
  await Shop.findByIdAndUpdate(contract.shop._id, {
    status: 'actif',
    id_user: contract.user._id
  });
}

module.exports = router;