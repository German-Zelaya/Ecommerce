// controllers/gameStoreController.js
const productService = require("../servicio/productService");

const productController = {
  read: (req, res) => {
    productService.getProducts((err, products) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.json(products);
    });
  },

  create: (req, res) => {
    const { code, name, price, stock, description, thumbnail, image1, image2 } =
      req.body;
    productService.createProduct(
      { code, name, price, stock, description, thumbnail, image1, image2 },
      (err, newProduct) => {
        if (err) return res.status(500).send("Error al crear el producto");
        res.status(201).json(newProduct);
      }
    );
  },

  update: (req, res) => {
    const {
      id,
      code,
      name,
      price,
      stock,
      description,
      thumbnail,
      image1,
      image2,
    } = req.body;
    productService.updateProduct(
      id,
      { code, name, price, stock, description, thumbnail, image1, image2 },
      (err, updatedProduct) => {
        if (err) return res.status(500).send("Error al actualizar el producto");
        res.status(200).json(updatedProduct);
      }
    );
  },

  delete: (req, res) => {
    const { id } = req.body;
    productService.deleteProduct(id, (err, deletedProduct) => {
      if (err) return res.status(500).send("Error al eliminar el producto");
      res.status(200).json(deletedProduct);
    });
  },
};

module.exports = productController;
