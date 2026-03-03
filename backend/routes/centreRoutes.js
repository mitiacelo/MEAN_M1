const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const fs         = require('fs');
const Centre     = require('../models/Centre');
const cloudinary = require('../config/cloudinary'); // meme config que productRoutes

// Multer memoire identique a productRoutes
const upload = multer({ dest: 'uploads/' });

// GET /centre
router.get('/', async (req, res) => {
  try {
    let centre = await Centre.findOne();
    if (!centre) centre = await Centre.create({ nom: 'Mon Centre Commercial' });
    res.json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /centre
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

// POST /centre/logo
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier recu' });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'centre' });
    fs.unlinkSync(req.file.path);

    let centre = await Centre.findOne();
    if (!centre) centre = new Centre({ nom: 'Mon Centre' });
    centre.logo = result.secure_url;
    await centre.save();

    res.json({ logo: centre.logo, centre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /centre/banniere
router.post('/banniere', upload.single('banniere'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier recu' });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'centre' });
    fs.unlinkSync(req.file.path);

    let centre = await Centre.findOne();
    if (!centre) centre = new Centre({ nom: 'Mon Centre' });
    centre.banniere = result.secure_url;
    await centre.save();

    res.json({ banniere: centre.banniere, centre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;