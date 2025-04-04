const mongoose = require("mongoose");

const newProductSchema = new mongoose.Schema({
  picture: {
    type: String,
    required: [true, "La imagen es requerida."],
    match: [
      /\.(jpg|jpeg|png|gif)$/i,
      "La imagen debe ser un archivo válido (jpg, jpeg, png, gif).",
    ],
  },
  cloudinaryPublicId: {
    type: String,
    required: false,
  },
  nombre: {
    type: String,
    required: [true, "El nombre es requerido."],
    minlength: [3, "El nombre debe tener al menos 3 caracteres."],
    maxlength: [100, "El nombre no puede exceder los 100 caracteres."],
  },
  productId: {
    type: String,
    required: [true, "El código del producto es requerido."],
    unique: true,
    match: [
      /^[A-Za-z0-9]{5,20}$/,
      "El código debe contener solo letras y números (5-20 caracteres).",
    ],
  },
  precioDeCompra: {
    type: Number,
    required: [true, "El precio es requerido."],
    min: [0, "El precio debe ser mayor o igual a 0."],
    max: [100000000, "El precio no puede exceder de 100,000,000."],
  },
  accesorio: {
    type: String,
    required: [true, "El accesorio es requerido."],
    enum: {
      values: ["anillo", "brazalete", "cadena", "esclava", "arete"],
      message: "El accesorio seleccionado no es válido.",
    },
  },
  material: {
    type: String,
    required: [true, "El material es requerido."],
    enum: {
      values: ["oro de 18 kilates", "oro laminado", "oro de 24 kilates"],
      message: "El material seleccionado no es válido.",
    },
  },
  categoria: {
    type: String,
    required: [true, "La categoría es requerida."],
    enum: {
      values: [
        "hombre",
        "mujer",
        "nino",
        "nina",
        "unisexAdultos",
        "unisexNinos",
      ],
      message: "La categoría seleccionada no es válida.",
    },
  },
  descripcion: {
    type: String,
    required: [true, "La descripción es requerida."],
    minlength: [10, "La descripción debe tener al menos 10 caracteres."],
    maxlength: [500, "La descripción no puede exceder los 500 caracteres."],
  },
});

const Product = mongoose.model("Producto", newProductSchema);
module.exports = Product;
