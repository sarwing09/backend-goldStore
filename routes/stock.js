const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock');

// Obtener todo el stock
router.get('/', stockController.getAllStock);

// Obtener el stock de un producto por su ID
router.get('/products/:productId', stockController.getStockByProductId);

// Obtener el nombre del producto por su ID
router.get('/products/:productId/name', stockController.getProductNameById);

// Agregar un movimiento de stock
router.post('/products/:productId/movimientos', stockController.agregarMovimiento);

// Actualizar la cantidad de stock
router.put('/products/:productId', stockController.actualizarStock);

// Crear stock inicial
router.post('/crear-stock', stockController.crearStockInicial);

// Eliminar stock
router.delete('/:productId', stockController.eliminarStock);

// Obtener productos sin stock
router.get('/products-without-stock', stockController.getProductsWithoutStock);

module.exports = router;