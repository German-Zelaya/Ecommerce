// controllers/gameStoreController.js
const productService = require("../servicio/productService");
const gameStoreService = require("../servicio/gameStoreServices");
const moment = require("moment");

const productController = {
  index: (req, res) => {
    gameStoreService.getCategories((err, categories) => {
      if (err) return res.status(500).send("Error al obtener las categorias");
      productService.getProducts((err, products) => {
        if (err) return res.status(500).send("Error al obtener los productos");
        res.render("index", { title: "Inicio", products });
      });
    });
  },
  getCategories: () => {
    return new Promise((resolve, reject) => {
      gameStoreService.getCategories((err, categories) => {
        if (err) {
          reject(err);
        } else {
          resolve(categories);
        }
      });
    });
  },
  search: (req, res) => {
    const { search } = req.body;
    productService.searchProducts(search, (err, products) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.render("searchResults", {
        title: "Resultados de Busqueda",
        products,
      });
    });
  },
  getProductsByCategory: (req, res) => {
    const { id } = req.params;
    gameStoreService.getCategory(id, (err, category) => {
      if (err) return res.status(500).send("Error al obtener las categorias");
      productService.getProductsByCategory(id, (err, products) => {
        if (err) return res.status(500).send("Error al obtener los productos");
        const now = moment();
        products.forEach((product) => {
          const updateAt = moment(product.updateAt);
          product.isNew = now.diff(updateAt, "days") <= 7; // Consideramos "Nuevo" si tiene 7 días o menos
        });
        res.render("categoryProducts", {
          title: "Productos por Categoria",
          category,
          products,
        });
      });
    });
  },
  read: (req, res) => {
    gameStoreService.getCategories((err, categories) => {
      if (err) return res.status(500).send("Error al obtener las categorias");
      productService.getProducts((err, products) => {
        if (err) return res.status(500).send("Error al obtener los productos");
        res.render("showproducts", {
          title: "Gestion de Productos",
          products,
        });
      });
    });
  },
  form: (req, res) => {
    gameStoreService.getCategories((err, categories) => {
      if (err) return res.status(500).send("Error al obtener las categorias");
      res.render("createProduct", { title: "Crear Producto", categories });
    });
  },
  get: (req, res) => {
    const { id } = req.params;
    productService.getProduct(id, (err, product) => {
      if (err) return res.status(500).send("Error al obtener el producto");
      gameStoreService.getCategories((err, categories) => {
        if (err) return res.status(500).send("Error al obtener las categorias");
        res.render("editProduct", { title: "Editar Producto", product });
      });
    });
  },

  product: (req, res) => {
    const { id } = req.params;
    productService.getProduct(id, (err, product) => {
      if (err) return res.status(500).send("Error al obtener el producto");
      res.render("product", { title: "Detalle del Producto", product });
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
