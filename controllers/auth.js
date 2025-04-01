const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');



exports.newUser = async (req, res) => {

    const { name, email, password } = req.body;


    try {

        //TODO: ferificar el eamail
        const usuario = await User.findOne({ email: email });

        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe  con ese correo'
            });
        }

        //TODO: crear usuario en la base de datos
        const dbUser = new User(req.body)


        //TODO: hashear la contraseña
        const salt = bcrypt.genSaltSync();
        dbUser.password = bcrypt.hashSync(password, salt);


        //TODO: generar el JWT
        const token = await generarJWT(dbUser.id, name);



        //TODO: crear usuario de DB
        dbUser.save();

        //TODO: generar respuesta exitosa
        return res.status(200).json({
            ok: true,
            uid: dbUser.id,
            name,
            email,
            token,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
    }


}

exports.loginUser = async (req, res) => {

    const { email, password } = req.body;

    try {

        const dbUser = await User.findOne({ email });

        if (!dbUser) {
            return res.status(400).json({
                ok: false,
                msg: 'el correo no existe'
            })
        }

        // confirmar si el password hace match
        const validPassword = bcrypt.compareSync(password, dbUser.password);

        if (!validPassword) {

            return res.status(400).json({
                ok: false,
                msg: 'El password no es válido'
            })

        }

        // Generar el JWT
        const token = await generarJWT(dbUser.id, dbUser.name);

        // Respuesta del servicio
        return res.status(200).json({
            ok:true,
            uid:dbUser.id,
            name:dbUser.name,
            email:dbUser.email,
            token
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            ok: false,
            msg: 'hable con el administrador'
        })
    }

}

exports.revalidarToken = async (req, res) =>{

    const { uid } = req;

    // Leer la base de datos

    const dbUser = await User.findById(uid);



    // Generar el JWT
    const token = await generarJWT(uid, dbUser);


    return res.json({
        ok: true,
        uid,
        name: dbUser.name,
        email: dbUser.email,
        token
    })

}