const { Router } = require('express');
const multer = require('multer');
const { 
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  subirImagen,
  subirImagenes,
  getProductByProductId,
  getProductsWithoutStock
} = require('../controllers/products');

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const router = Router();

// Rutas de productos
router.post('/agregar', upload.single('image'), addProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.single('image'), updateProduct); // Modificado para aceptar imágenes
router.get('/product-by-id/:productId', getProductByProductId);


router.get('/without-stock', getProductsWithoutStock);
router.post('/images/single', upload.single('image'), subirImagen);
router.post('/images/multi', upload.array('image', 10), subirImagenes);

module.exports = router;