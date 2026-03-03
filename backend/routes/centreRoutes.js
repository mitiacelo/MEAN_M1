const express = require('express');
const router  = express.Router();
const Centre  = require('../models/Centre');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ── Multer helper ─────────────────────────────────
const makeUpload = (subdir) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `uploads/${subdir}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, subdir + path.extname(file.originalname))
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|svg|webp/.test(path.extname(file.originalname).toLowerCase()));
  }
});

// ── GET /centre ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let centre = await Centre.findOne();
    if (!centre) centre = await Centre.create({ nom: 'Mon Centre Commercial' });
    res.json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /centre ── mise à jour infos texte ─────────
router.put('/', async (req, res) => {
  try {
    const fields = [
      'nom','slogan','adresse','ville','telephone','email','siteWeb',
      'description','heureOuverture','nombreBoutiques','nombreVisiteurs',
      'anneeFondation','chiffresEtAtouts','facebook','instagram'
    ];
    let centre = await Centre.findOne();
    if (!centre) centre = new Centre({ nom: 'Mon Centre' });
    fields.forEach(f => { if (req.body[f] !== undefined) centre[f] = req.body[f]; });
    await centre.save();
    res.json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /centre/logo ─────────────────────────────
router.post('/logo', makeUpload('logos').single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
    let centre = await Centre.findOne();
    if (!centre) centre = new Centre({ nom: 'Mon Centre' });
    centre.logo = `/uploads/logos/${req.file.filename}`;
    await centre.save();
    res.json({ logo: centre.logo, centre });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /centre/banniere ─────────────────────────
router.post('/banniere', makeUpload('bannieres').single('banniere'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
    let centre = await Centre.findOne();
    if (!centre) centre = new Centre({ nom: 'Mon Centre' });
    centre.banniere = `/uploads/bannieres/${req.file.filename}`;
    await centre.save();
    res.json({ banniere: centre.banniere, centre });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;