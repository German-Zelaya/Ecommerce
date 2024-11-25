// services/gameStoreServices.js
const { search } = require("../interfaz/productController");
const { db } = require("../modelo/gameStoreModels");

const productService = {
  getProducts: (callback) => {
    const query = "SELECT * FROM products";
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error al obtener productos:", err);
        return callback(err);
      }
      callback(null, rows);
    });
  },
  searchProducts: (query, callback) => {
    const sql =
      "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?";
    db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
      if (err) {
        console.error("Error al buscar productos:", err);
        return callback(err);
      }
      callback(null, rows);
    });
  },
  getProductsByCategory: (categoryId, callback) => {
    const query = "SELECT * FROM products WHERE category_id = ?";
    db.all(query, [categoryId], (err, rows) => {
      if (err) {
        console.error("Error al obtener productos por categoría:", err);
        return callback(err);
      }
      callback(null, rows);
    });
  },

  getProduct: (productId, callback) => {
    const query = "SELECT * FROM products WHERE id = ?";
    db.get(query, [productId], (err, row) => {
      console.log("Producto obtenido:", row);
      if (err) {
        console.error("Error al obtener producto:", err);
        return callback(err);
      }
      callback(null, row);
    });
  },

  createProduct: (productData, callback) => {
    const {
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
    } = productData;
    const query =
      "INSERT INTO products (code, name, price, stock, description, updateAt, thumbnail, image1, image2, size, classification, category_id) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?)";
    db.run(
      query,
      [
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
      ],
      function (err) {
        if (err) {
          console.error("Error al crear producto:", err);
          return callback(err);
        }
        console.log("Producto creado con ID:", this.lastID);
        callback(null, {
          id: this.lastID,
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
        });
      }
    );
  },

  updateProduct: (productId, productData, callback) => {
    const {
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
    } = productData;
    const query =
      "UPDATE products SET code = ?, name = ?, price = ?, stock = ?, description = ?, updateAt = datetime('now'), thumbnail = ?, image1 = ?, image2 = ?, size = ?, classification = ?, category_id = ? WHERE id = ?";
    db.run(
      query,
      [
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
        productId,
      ],
      function (err) {
        if (err) {
          console.error("Error al actualizar producto:", err);
          return callback(err);
        }
        console.log("Producto actualizado con ID:", productId);
        callback(null, {
          id: productId,
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
        });
      }
    );
  },

  deleteProduct: (productId, callback) => {
    const query = "DELETE FROM products WHERE id = ?";
    db.run(query, [productId], function (err) {
      if (err) {
        console.error("Error al eliminar producto:", err);
        return callback(err);
      }
      console.log("Producto eliminado con ID:", productId);
      callback(null, productId);
    });
  },
};

module.exports = productService;
