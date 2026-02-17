const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Inscription
router.post('/register', [
    // ... validations inchangées
  ], async (req, res) => {
    console.log('POST /register - body reçu :', req.body);
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erreurs validation :', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      console.log('Recherche utilisateur par email...');
      let user = await User.findOne({ email: req.body.email });
  
      if (user) {
        console.log('Email déjà utilisé');
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
  
      console.log('Création nouvelle instance User');
      user = new User(req.body);
  
      console.log('Sauvegarde utilisateur...');
      await user.save();
  
      console.log('Génération token JWT');
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'ta_cle_secrete_tres_longue_ici',
        { expiresIn: '7d' }
      );
  
      console.log('Envoi réponse 201');
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, firstname: user.firstname, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error('ERREUR CRITIQUE dans /register :');
      console.error(err.stack || err);
      res.status(500).json({
        message: 'Erreur serveur interne',
        details: err.message || 'Erreur inconnue'
      });
    }
  });

// Connexion
router.post('/login', async (req, res) => {
    console.log('╔═══════ POST /login atteint ═══════╗');
    console.log('Body reçu :', req.body);
  
    const { email, password } = req.body;
  
    try {
      // ← IMPORTANT : .select('+password') pour forcer l'inclusion du champ caché
      const user = await User.findOne({ email }).select('+password');
  
      if (!user) {
        console.log('Utilisateur non trouvé');
        return res.status(400).json({ message: 'Identifiants incorrects' });
      }
  
      console.log('Utilisateur trouvé, password présent ?', !!user.password);
  
      const isMatch = await user.comparePassword(password);
      console.log('Résultat comparaison :', isMatch);
  
      if (!isMatch) {
        console.log('Mot de passe incorrect');
        return res.status(400).json({ message: 'Identifiants incorrects' });
      }
  
      console.log('Mot de passe OK → token');
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'ta_cle_secrete_tres_longue_ici',
        { expiresIn: '7d' }
      );
  
      res.json({
        token,
        user: { id: user._id, name: user.name, firstname: user.firstname, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error('ERREUR DANS /login :', err);
      res.status(500).json({ message: err.message || 'Erreur serveur' });
    }
  });
  // ✅ NOUVEAU : GET /auth/users → liste tous les users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;