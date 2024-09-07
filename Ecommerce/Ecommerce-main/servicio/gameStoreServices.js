// services/gameStoreServices.js
const { db } = require('../modelo/gameStoreModels');

const GameStoreServices = {

  getCategories: (callback) => {
    const query = "SELECT * FROM categories";
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error al obtener categorías:', err);
        return callback(err);
      }
      console.log('Categorías obtenidas:', rows);
      callback(null, rows);
    });
  },

  createCategory: (categoryData, callback) => {
    const { name, description, image } = categoryData;
    const query = "INSERT INTO categories (name, description, image, updateAt) VALUES (?, ?, ?, datetime('now'))";
    db.run(query, [name, description, image], function(err) {
      if (err) {
        console.error('Error al crear categoría:', err);
        return callback(err);
      }
      console.log('Categoría creada con ID:', this.lastID);
      callback(null, { id: this.lastID, name, description, image });
    });
  },

  // Servicio para obtener todos los productos (videojuegos)
  getProducts: (callback) => {
    const query = "SELECT * FROM products";
    db.all(query, [], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  },

  // Servicio para añadir un producto al carrito
  addToCart: (userId, productId, quantity, callback) => {
    db.serialize(() => {
      // Primero, obtenemos o creamos el carrito del usuario
      db.get("SELECT id FROM carts WHERE userId = ?", [userId], (err, cart) => {
        if (err) return callback(err);

        if (!cart) {
          db.run("INSERT INTO carts (userId) VALUES (?)", [userId], function(err) {
            if (err) return callback(err);
            addItemToCart(this.lastID, productId, quantity, callback);
          });
        } else {
          addItemToCart(cart.id, productId, quantity, callback);
        }
      });
    });
  },

  // Servicio para crear una orden a partir del carrito
  createOrder: (userId, callback) => {
    db.serialize(() => {
      // Primero, obtenemos el carrito del usuario
      db.get("SELECT id FROM carts WHERE userId = ?", [userId], (err, cart) => {
        if (err) return callback(err);
        if (!cart) return callback(new Error("No se encontró el carrito"));

        // Creamos la orden
        db.run("INSERT INTO orders (userId, date, status) VALUES (?, datetime('now'), 'pending')", [userId], function(err) {
          if (err) return callback(err);
          const orderId = this.lastID;

          // Transferimos los items del carrito a la orden
          db.all("SELECT * FROM cartItems WHERE cartId = ?", [cart.id], (err, items) => {
            if (err) return callback(err);

            const stmt = db.prepare("INSERT INTO orderItems (orderId, productId, quantity, unitPrice) VALUES (?, ?, ?, ?)");
            items.forEach(item => {
              stmt.run(orderId, item.productId, item.quantity, 0); // Aquí deberías obtener el precio real del producto
            });
            stmt.finalize();

            // Limpiamos el carrito
            db.run("DELETE FROM cartItems WHERE cartId = ?", [cart.id], (err) => {
              if (err) return callback(err);
              callback(null, orderId);
            });
          });
        });
      });
    });
  },

  // Servicio para obtener los detalles de una orden
  getOrderDetails: (orderId, callback) => {
    const query = `
      SELECT o.id as orderId, o.date, o.status, 
             oi.productId, oi.quantity, oi.unitPrice, 
             p.name as productName
      FROM orders o
      JOIN orderItems oi ON o.id = oi.orderId
      JOIN products p ON oi.productId = p.id
      WHERE o.id = ?
    `;
    db.all(query, [orderId], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }
};

function addItemToCart(cartId, productId, quantity, callback) {
  const query = "INSERT OR REPLACE INTO cartItems (cartId, productId, quantity) VALUES (?, ?, ?)";
  db.run(query, [cartId, productId, quantity], function(err) {
    if (err) return callback(err);
    callback(null, this.lastID);
  });
}

module.exports = GameStoreServices;