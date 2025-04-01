const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de usuario es requerido.'],
  },
  email: {
    type: String,
    required: [true, 'El correo de usuario es requerido.'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña de usuario es requerido.'],
  },

});

const User = mongoose.model('User', userSchema);
module.exports = User;