const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('─────────────────────────────');
  console.log('METHOD + PATH:', req.method, req.originalUrl);
  console.log('Headers complets reçus :');
  console.log(req.headers); // ← TOUS les headers
  console.log('Authorization header exact :', req.headers.authorization || 'AUCUN');

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('→ Token manquant ou mal formé');
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extrait :', token ? token.substring(0, 30) + '...' : 'AUCUN');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('→ Token VALIDE → user ID :', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('→ Token INVALIDE :', err.name, err.message);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};