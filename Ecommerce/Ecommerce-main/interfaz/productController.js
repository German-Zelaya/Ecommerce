// controllers/gameStoreController.js
const productService = require("../servicio/productService");
const gameStoreService = require("../servicio/gameStoreServices");

const productController = {
  read: (req, res) => {
    productService.getProducts((err, products) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.render("showproducts", { products });
    });
  },
  form: (req, res) => {
    gameStoreService.getCategories((err, categories) => {
      if (err) return res.status(500).send("Error al obtener las categorias");
      res.render("createProduct", { categories });
    });
  },
  get: (req, res) => {
    const { id } = req.params;
    productService.getProduct(id, (err, product) => {
      if (err) return res.status(500).send("Error al obtener el producto");
      gameStoreService.getCategories((err, categories) => {
        if (err) return res.status(500).send("Error al obtener las categorias");
        res.render("editProduct", { product, categories });
      });
    });
  },

  create: (req, res) => {
    const {
      code,
      name,
      price,
      stock,
      description,
      size,
      classification,
      category,
    } = req.body;

    const thumbnail =
      req.files["thumbnail"] && req.files["thumbnail"][0]
        ? req.files["thumbnail"][0].filename
        : null;
    const image1 =
      req.files["image1"] && req.files["image1"][0]
        ? req.files["image1"][0].filename
        : null;
    const image2 =
      req.files["image2"] && req.files["image2"][0]
        ? req.files["image2"][0].filename
        : null;

    // Si alguno de los archivos es obligatorio, puedes validar aquí si falta alguno
    if (!thumbnail || !image1 || !image2) {
      return res.status(400).send("Uno o más archivos están ausentes");
    }

    productService.createProduct(
      {
        code,
        name,
        price,
        stock,
        description,
        thumbnail,
        image1,
        image2,
        size,
        classification,
        category,
      },
      (err, newProduct) => {
        if (err) return res.status(500).send("Error al crear el producto");
        res.redirect("/products");
      }
    );
  },

  update: (req, res) => {
    const { id } = req.params;
    const {
      code,
      name,
      price,
      stock,
      description,
      size,
      classification,
      category,
    } = req.body;

    // Verificar si se subieron nuevas imágenes
    const thumbnail = req.files["thumbnail"]
      ? req.files["thumbnail"][0].filename
      : req.body.currentThumbnail;
    const image1 = req.files["image1"]
      ? req.files["image1"][0].filename
      : req.body.currentImage1;
    const image2 = req.files["image2"]
      ? req.files["image2"][0].filename
      : req.body.currentImage2;

    productService.updateProduct(
      id,
      {
        code,
        name,
        price,
        stock,
        description,
        thumbnail,
        image1,
        image2,
        size,
        classification,
        category,
      },
      (err, updatedProduct) => {
        if (err) return res.status(500).send("Error al actualizar el producto");
        res.redirect("/products");
      }
    );
  },

  delete: (req, res) => {
    const { id } = req.params;
    productService.deleteProduct(id, (err, deletedProduct) => {
      if (err) return res.status(500).send("Error al eliminar el producto");
      res.redirect("/products");
    });
  },
};

module.exports = productController;
