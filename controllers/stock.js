const mongoose = require('mongoose');
const Stock = require("../models/stock");
const Product = require("../models/product");

// Obtener el stock de un producto por su ID
exports.getStockByProductId = async (req, res) => {
  try {
    const stock = await Stock.findOne({ productId: req.params.productId });
    if (!stock) {
      return res.status(404).json({ message: 'Stock no encontrado.' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agregar un movimiento de stock
exports.agregarMovimiento = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tipo, cantidad, nombre } = req.body;
    let stock = await Stock.findOne({ productId: req.params.productId }).session(session);

    if (!stock) {
      stock = new Stock({ 
        productId: req.params.productId, 
        nombre,
        cantidad: 0, 
        movimientos: [] 
      });
    }

    if (tipo === 'salida' && stock.cantidad - cantidad < 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    const updatedStock = await Stock.findOneAndUpdate(
      { productId: req.params.productId },
      { 
        $inc: { cantidad: tipo === 'entrada' ? cantidad : -cantidad },
        $push: { movimientos: { tipo, cantidad } }
      },
      { new: true, session }
    );

    await session.commitTransaction();
    res.status(201).json(updatedStock);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Actualizar la cantidad de stock
exports.actualizarStock = async (req, res) => {
  try {
    const { cantidad, nombre } = req.body;
    const stock = await Stock.findOneAndUpdate(
      { productId: req.params.productId },
      { cantidad, nombre },
      { new: true }
    );

    if (!stock) {
      return res.status(404).json({ message: "Stock no encontrado." });
    }

    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todo el stock
exports.getAllStock = async (req, res) => {
  try {
    const stock = await Stock.find();
    if (stock.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay registros de stock disponibles." });
    }
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener el nombre del producto por su ID
exports.getProductNameById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json({ nombre: product.nombre });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Método para crear stock inicial
exports.crearStockInicial = async (req, res) => {
  try {
    const { productId, cantidad } = req.body;

    let stock = await Stock.findOne({ productId });

    if (stock) {
      return res
        .status(400)
        .json({ message: "Ya existe un registro de stock para este producto." });
    }

    const producto = await Product.findOne({ productId });

    if (!producto) {
      return res
        .status(404)
        .json({ message: "El producto no existe en el catálogo." });
    }

    if (cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad inicial debe ser mayor que 0." });
    }

    const movimientoInicial = {
      tipo: 'entrada_inicial',
      cantidad: cantidad,
      fecha: new Date()
    };

    stock = new Stock({
      productId,
      nombre: producto.nombre,
      cantidad,
      movimientos: [movimientoInicial],
    });

    await stock.save();
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar stock
exports.eliminarStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({
      productId: req.params.productId,
    });
    if (!stock) {
      return res.status(404).json({ message: "Stock no encontrado." });
    }
    res.json({ message: "Stock eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener productos sin stock
exports.getProductsWithoutStock = async (req, res) => {
  try {
    const products = await Product.find();
    const stocks = await Stock.find();
    
    const productsWithoutStock = products.filter(product => 
      !stocks.some(stock => stock.productId === product.productId)
    );

    res.json(productsWithoutStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};