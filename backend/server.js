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
  .then(() => console.log("MongoDB connecté Atlas✅"))
  .catch(err => console.error("Erreur de connexion MongoDB :", err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use('/articles', require('./routes/articleRoutes'));
app.use('/grille', require('./routes/grilleRoutes'));
app.use('/blocks', require('./routes/blockRoutes'));
app.use('/shops', require('./routes/shopRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/types', require('./routes/typeRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/stock-mouvements', require('./routes/stockMouvementRoutes'));
app.use('/price-products', require('./routes/priceProductRoutes'));
app.use('/boutiques', require('./routes/boutiqueRoutes'));
app.use('/domaines', require('./routes/domaineRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/purchases', require('./routes/purchaseRoutes'));
app.use('/contracts', require('./routes/contractRoutes'));
app.use('/loyers', require('./routes/loyerRoutes'));
app.use('/maintenance', require('./routes/maintenanceRoutes')); 

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));