const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté ✅"))
  .catch(err => console.error("Erreur de connexion MongoDB :", err));

 // Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/articles', require('./routes/articleRoutes'));
app.use('/grille', require('./routes/grilleRoutes'));
app.use('/blocks', require('./routes/blockRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.listen(PORT, () => console.log(`Serveur démarré sur le port
${PORT}`));
