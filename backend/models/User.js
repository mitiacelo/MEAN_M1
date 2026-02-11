const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  firstname:  { type: String, required: true, trim: true },
  email:      { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password:   { 
    type: String, 
    required: true, 
    minlength: 6,
    select: false   // ← IMPORTANT : ne renvoie JAMAIS le password par défaut
  },
  role:       { 
    type: String, 
    enum: ['user', 'admin', 'manager'], 
    default: 'user' 
  },
  id_shop:    { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
}, { timestamps: true });

// Hook de hashage – version robuste sans next en paramètre
userSchema.pre('save', async function () {
  console.log('Hook pre-save déclenché – password modifié ?', this.isModified('password'));

  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    console.log('Salt généré');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashé avec succès');
  } catch (err) {
    console.error('Erreur lors du hashage :', err);
    throw err;
  }
});

// Méthode comparePassword – avec log pour debug
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    console.error('Password non défini dans l\'objet user !');
    return false;
  }
  console.log('Comparaison bcrypt – candidate:', candidatePassword.length, 'hash existant:', !!this.password);
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);