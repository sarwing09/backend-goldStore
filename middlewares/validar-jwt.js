const jwt = require('jsonwebtoken');
const User = require('../models/user');


exports.validarJWT = async (req, res, next) => {
    try {
        const token = req.header('x-token');
        if (!token) {
            return res.status(401).json({ ok: false, msg: 'Token no proporcionado' });
        }

        const { uid } = jwt.verify(token, process.env.SECRET_JWT_SEED);
        const user = await User.findById(uid);
        
        if (!user) {
            return res.status(401).json({ ok: false, msg: 'Usuario no existe' });
        }

        // Inyecta datos actualizados en la request
        req.uid = uid;
        req.user = user; // ✔️ Mejor práctica: adjunta el usuario completo
        next(); // ✔️ Continuar al controlador
    } catch (error) {
        return res.status(401).json({ ok: false, msg: 'Token inválido' });
    }
};