// backend/scripts/init-data.js
const mongoose = require('mongoose');
require('dotenv').config();

const Domaine = require('../models/Domaine');
const Category = require('../models/Category');
const Type = require('../models/Type');

async function init() {
  await mongoose.connect(process.env.MONGO_URI);

  // Domaines
  await Domaine.insertMany([
    { name: 'sport' },
    { name: 'beauty' },
    { name: 'clothes' },
    { name: 'food' },
    { name: 'tech' }
  ]);

  console.log('Domaines insérés');

  // Catégories (exemples)
  await Category.insertMany([
    { name: 'comestible', id_domaine: await Domaine.findOne({ name: 'sport' }).select('_id') },
    { name: 'accessoire', id_domaine: await Domaine.findOne({ name: 'beauty' }).select('_id') },
    { name: 'vêtements', id_domaine: await Domaine.findOne({ name: 'clothes' }).select('_id') }
  ]);

  console.log('Catégories insérées');

  // Types (exemples)
  await Type.insertMany([
    { name: 'complément', id_category: await Category.findOne({ name: 'comestible' }).select('_id') },
    { name: 'masque', id_category: await Category.findOne({ name: 'accessoire' }).select('_id') },
    { name: 'masque', id_category: await Category.findOne({ name: 'accessoire' }).select('_id') },
  ]);

  console.log('Types insérés');

  mongoose.connection.close();
}

init().catch(console.error);