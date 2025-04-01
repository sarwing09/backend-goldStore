const { Router } = require('express');
const authController = require('../controllers/auth')
const {validarJWT} = require('../middlewares/validar-jwt')


const router = Router();


router.post('/new', authController.newUser);
router.post('/', authController.loginUser);
router.get('/renew', validarJWT, authController.revalidarToken);


module.exports = router;