// services/gameStoreServices.js
const { db } = require("../modelo/gameStoreModels");

const productService = {
  getProducts: (callback) => {
    const query = "SELECT * FROM products";
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error al obtener categorías:", err);
        return callback(err);
      }
      console.log("Categorías obtenidas:", rows);
      callback(null, rows);
    });
  },

  createProduct: (productData, callback) => {
    const { code, name, price, stock, description, thumbnail, image1, image2 } =
      productData;
    const query =
      "INSERT INTO products (code, name, price, stock, description, updateAt, thumbnail, image1, image2) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)";
    db.run(
      query,
      [code, name, price, stock, description, thumbnail, image1, image2],
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
        });
      }
    );
  },

  updateProduct: (productId, productData, callback) => {
    const { code, name, price, stock, description, thumbnail, image1, image2 } =
      productData;
    const query =
      "UPDATE products SET code = ?, name = ?, price = ?, stock = ?, description = ?, updateAt = datetime('now'), thumbnail = ?, image1 = ?, image2 = ? WHERE id = ?";
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
