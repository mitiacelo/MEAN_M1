const express  = require('express');
const router   = express.Router();
const Centre   = require('../models/Centre');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

// ── Multer : upload logo ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/logos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'logo-centre' + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|svg|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

// ── GET /api/centre ── récupérer les infos
router.get('/', async (req, res) => {
  try {
    // Il n'y a qu'un seul document Centre dans la BDD
    let centre = await Centre.findOne();
    if (!centre) {
      // Créer un document vide au premier accès
      centre = await Centre.create({ nom: 'Mon Centre Commercial' });
    }
    res.json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/centre ── mettre à jour les infos
router.put('/', async (req, res) => {
  try {
    const { nom, slogan, adresse, ville, telephone, email } = req.body;
    let centre = await Centre.findOne();
    if (!centre) centre = new Centre();

    if (nom)       centre.nom       = nom;
    if (slogan !== undefined)   centre.slogan   = slogan;
    if (adresse !== undefined)  centre.adresse  = adresse;
    if (ville !== undefined)    centre.ville    = ville;
    if (telephone !== undefined) centre.telephone = telephone;
    if (email !== undefined)    centre.email    = email;

    await centre.save();
    res.json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/centre/logo ── uploader un logo
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    let centre = await Centre.findOne();
    if (!centre) centre = new Centre({ nom: 'Mon Centre' });
    centre.logo = logoUrl;
    await centre.save();

    res.json({ logo: logoUrl, centre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;