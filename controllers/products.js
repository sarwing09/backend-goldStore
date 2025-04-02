const fs = require("node:fs");
const Product = require("../models/product");
const Stock = require("../models/stock");
const cloudinary = require('cloudinary').v2;
const path = require('path');


// Obtener todos los productos con filtros opcionales y paginación
exports.getProducts = async (req, res) => {
  try {
    const { 
      categoria, 
      material, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filters = {};
    
    if (categoria) filters.categoria = categoria;
    if (material) filters.material = material;
    if (minPrice || maxPrice) {
      filters.precioDeCompra = {};
      if (minPrice) filters.precioDeCompra.$gte = parseFloat(minPrice);
      if (maxPrice) filters.precioDeCompra.$lte = parseFloat(maxPrice);
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    const total = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      limit: limitNumber,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un producto por su ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener producto por productId
exports.getProductByProductId = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo producto
exports.addProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "La imagen es requerida" });
    }

    // Subir imagen a Cloudinary manteniendo nombre original exacto
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `${process.env.CLOUDINARY_FOLDER}/${req.file.originalname}`,
      unique_filename: true,
      overwrite: true,
      resource_type: 'auto'
    });

    const productData = {
      ...req.body,
      picture: result.secure_url,
      cloudinaryPublicId: result.public_id
    };

    // Eliminar el archivo temporal
    fs.unlinkSync(req.file.path);

    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  try {
    let updateData = {};

    if (req.file) {
      // Primero obtenemos el producto actual para eliminar la imagen anterior
      const currentProduct = await Product.findById(req.params.id);
      
      // Subir nueva imagen a Cloudinary manteniendo nombre original exacto
      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `goldstore/products/${req.file.originalname}`,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: 'auto'
      });

      updateData = {
        ...req.body,
        picture: result.secure_url,
        cloudinaryPublicId: result.public_id
      };

      // Eliminar la imagen anterior de Cloudinary si existe
      if (currentProduct && currentProduct.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(currentProduct.cloudinaryPublicId);
      }

      // Eliminar el archivo temporal
      fs.unlinkSync(req.file.path);
    } else {
      updateData = req.body;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Subir imagen
exports.subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `goldstore/products/${req.file.originalname}`,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: 'auto'
    });

    fs.unlinkSync(req.file.path);

    res.status(200).json({ 
      imagePath: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subir múltiples imágenes
exports.subirImagenes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron imágenes" });
    }

    const uploadPromises = req.files.map(file => 
      cloudinary.uploader.upload(file.path, {
        public_id: `goldstore/products/${file.originalname}`,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: 'auto'
      }).then(result => {
        fs.unlinkSync(file.path);
        return {
          imagePath: result.secure_url,
          publicId: result.public_id
        };
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    res.status(200).json({ uploadResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener productos sin stock
exports.getProductsWithoutStock = async (req, res) => {
  try {
    // Obtener todos los productos
    const products = await Product.find();
    
    // Obtener todos los stocks
    const stocks = await Stock.find();
    
    // Filtrar productos que no están en stock
    const productsWithoutStock = products.filter(product => 
      !stocks.some(stock => stock.productId === product.productId)
    );

    res.json(productsWithoutStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {

  try {
    const { productId } = req.params;
    
    // Buscar el producto por productId
    const product = await Product.findOne({ productId });
    console.log(product.productId)
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Eliminar imagen de Cloudinary si existe
       cloudinary.uploader.destroy(product.cloudinaryPublicId);
        console.log(`Imagen ${product.cloudinaryPublicId} eliminada de Cloudinary`);

    // Eliminar el producto y su stock asociado
    await Promise.all([
      Product.findOneAndDelete({ productId }),
      Stock.findOneAndDelete({ productId })
    ]);

    res.json({ 
      success: true,
      message: "Producto eliminado exitosamente" 
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      success: false,
      message: "Error interno al eliminar el producto" 
    });
  }
};