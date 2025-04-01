const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const dbConection = async () => {
    try {

        await mongoose.connect(process.env.BD_CNN, {});

        console.log('Base de datos online');

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log('Cloudinary configurado correctamente');

    } catch (error) {
        console.log(error)
    }

}
module.exports = {
    dbConection
}