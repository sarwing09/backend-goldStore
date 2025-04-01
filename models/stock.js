const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'El código del producto es requerido.'],
    ref: 'Producto'
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido.']
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida.'],
    min: [0, 'La cantidad no puede ser menor que 0.']
  },
  movimientos: [{
    tipo: {
      type: String,
      enum: ['entrada', 'salida'],
      required: [true, 'El tipo de movimiento es requerido.']
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad del movimiento es requerida.']
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }]
});

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;