// backend/api/index.js
const serverless = require('serverless-http');
const app = require('../server'); // ton app Express existante

module.exports = serverless(app);