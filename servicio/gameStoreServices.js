// services/gameStoreServices.js
const { get } = require("../interfaz/productController");
const { db } = require("../modelo/gameStoreModels");

const GameStoreServices = {
  getCategories: (callback) => {
    const query = "SELECT * FROM categories";
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error al obtener categorías:", err);
        return callback(err);
      }
      callback(null, rows);
    });
  },

  getCategory: (categoryId, callback) => {
    const query = "SELECT * FROM categories WHERE id = ?";
    db.get(query, [categoryId], (err, row) => {
      if (err) {
        console.error("Error al obtener categoría:", err);
        return callback(err);
      }
      callback(null, row);
    });
  },

  createCategory: (categoryData, callback) => {
    const { name, description, image } = categoryData;
    const query =
      "INSERT INTO categories (name, description, image, updateAt) VALUES (?, ?, ?, datetime('now'))";
    db.run(query, [name, description, image], function (err) {
      if (err) {
        console.error("Error al crear categoría:", err);
        return callback(err);
      }
      console.log("Categoría creada con ID:", this.lastID);
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
  addToCart: (cartId, productId, quantity, price, callback) => {
    const queryCheck = `SELECT * FROM cartitems WHERE cartId = ? AND productId = ?`;
    db.get(queryCheck, [cartId, productId], (err, item) => {
      if (err) return callback(err);

      if (item) {
        // Si ya existe, incrementa la cantidad
        const queryUpdate = `UPDATE cartitems SET quantity = quantity + ? WHERE id = ?`;
        db.run(queryUpdate, [quantity, item.id], callback);
      } else {
        // Si no existe, añade un nuevo ítem
        const queryInsert = `INSERT INTO cartitems (cartId, productId, quantity, price) VALUES (?, ?, ?, ?)`;
        db.run(queryInsert, [cartId, productId, quantity, price], callback);
      }
    });
  },

  removeFromCart: (cartItemId, callback) => {
    const query = `DELETE FROM cartitems WHERE id = ?`;
    db.run(query, [cartItemId], callback);
  },
  createCart: (userId, callback) => {
    db.run("INSERT INTO carts (userId) VALUES (?)", [userId], function (err) {
      if (err) return callback(err);
      callback(null, this.lastID);
    });
  },
  getCartByUserId: (userId, callback) => {
    db.get(
      "SELECT cartitems.id AS itemId, cartitems.quantity, cartitems.price, products.* FROM carts JOIN cartitems ON carts.id = cartitems.cartId JOIN products ON cartitems.productId = products.id WHERE userId = ?",
      [userId],
      callback
    );
  },
  getCart: (userId, callback) => {
    // Verificar si el carrito existe
    const checkCartQuery = `SELECT * FROM carts WHERE userId = ?`;
    db.get(checkCartQuery, [userId], (err, cart) => {
      if (err) {
        console.error("Error al verificar el carrito:", err);
        return callback(err);
      }
      if (!cart) {
        // Si no existe el carrito, crearlo
        const createCartQuery = `INSERT INTO carts (userId, createdAt, updatedAt) VALUES (?, datetime('now'), datetime('now'))`;

        db.run(createCartQuery, [userId], function (err) {
          if (err) {
            console.error("Error al crear el carrito:", err);
            return callback(err);
          }

          // Llamar al mismo método con el nuevo carrito creado
          const newCartId = this.lastID; // ID del carrito recién creado
          console.log("Carrito creado con ID:", newCartId);
          callback(null, []); // Devuelve un carrito vacío
        });
      } else {
        // Si el carrito existe, obtener sus productos
        const query = `SELECT * FROM carts WHERE userId = ?`;
        db.all(query, [userId], callback);
      }
    });
  },
  getCartItems: (userId, callback) => {
    const query = `SELECT cartitems.id AS itemId , cartitems.quantity, cartitems.price, products.* FROM cartitems JOIN products ON cartitems.productId = products.id WHERE cartId IN (SELECT id FROM carts WHERE userId = ?)`;
    db.all(query, [userId], callback);
  },
  updateCartItem: (itemId, quantity, callback) => {
    const query = `UPDATE cartitems SET quantity = ? WHERE id = ?`;
    db.run(query, [quantity, itemId], callback);
  },
  deleteCartItem: (itemId, callback) => {
    const query = `DELETE FROM cartitems WHERE id = ?`;
    db.run(query, [itemId], callback);
  },
  emptyCart: (userId, callback) => {
    const query = `DELETE FROM cartitems WHERE cartId IN (SELECT id FROM carts WHERE userId = ?)`;
    db.run(query, [userId], callback);
  },

  // Servicio para crear una orden a partir del carrito
  createOrder: (userId, status, callback) => {
    const query =
      "INSERT INTO orders (userId, date, status) VALUES (?, datetime('now'), ?)";
    db.run(query, [userId, status], function (err) {
      if (err) return callback(err);
      callback(null, this.lastID);
    });
  },
  deleteOrderItems: (orderId, callback) => {
    const query = "DELETE FROM orderItems WHERE orderId = ?";
    db.run(query, [orderId], function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    });
  },
  updateOrder: (orderId, userId, status, callback) => {
    const query = "UPDATE orders SET userId = ?, status = ? WHERE id = ?";
    db.run(query, [ userId, status, orderId], function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    });
  },
  deleteOrder: (orderId, callback) => {
    const query = "DELETE FROM orders WHERE id = ?";
    db.run(query, [orderId], function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    });
  },
  addOrderItems: (orderId, items, callback) => {
    console.log("orderId:", orderId);
    const query =
      "INSERT INTO orderItems (orderId, productId, quantity, unitPrice) VALUES (?, ?, ?, ?)";
    const stmt = db.prepare(query);
    items.forEach((item) => {
      stmt.run(
        [orderId, item.productId, item.quantity, item.unitPrice],
        (err) => {
          if (err) return callback(err);
        }
      );
    });
    stmt.finalize(callback);
  },
  addPayment: (orderId, amount, method, callback) => {
    const query =
      "INSERT INTO payments (orderId, amount, method) VALUES (?, ?, ?)";
    db.run(query, [orderId, amount, method], function (err) {
      if (err) return callback(err);
      callback(null, this.lastID);
    });
  },
  getOrders: (callback) => {
    const query =
      "SELECT orders.id, orders.date, orders.status, users.username, users.email FROM orders JOIN users ON orders.userId = users.id";
    db.all(query, [], callback);
  },
  getOrdersByUserId: (userId, callback) => {
    const query =
      "SELECT orders.id, orders.date, orders.status, users.username, users.email FROM orders JOIN users ON orders.userId = users.id WHERE userId = ? ORDER BY orders.date DESC";
    db.all(query, [userId], callback);
  },

  getOrderItems: (userId, callback) => {
    const query = `SELECT * FROM orderItems WHERE orderId IN (SELECT id FROM orders WHERE userId = ? AND status = 'Entregado' ORDER BY date DESC)`;
    db.all(query, [userId], callback);
  },
  getOrderItemsByOrderId: (orderId, callback) => {
    const query = `SELECT * FROM orderItems WHERE orderId = ?`;
    db.all(query, [orderId], callback);
  },
  getOrder: (orderId, callback) => {
    const query =
      "SELECT orders.id, orders.userId, orders.date, orders.status, users.username, users.email FROM orders JOIN users ON orders.userId = users.id WHERE orders.id = ?";
    db.get(query, [orderId], callback);
  },
  // Servicio para obtener los detalles de una orden
  getOrderDetails: (orderId, callback) => {
    const orderQuery = `SELECT orders.id, orders.userId, users.username, users.email, orders.date, orders.status FROM orders JOIN users ON orders.userId = users.id WHERE orders.id = ?`;
    const itemsQuery = `
      SELECT 
        orderItems.productId, 
        products.name, 
        orderItems.quantity, 
        orderItems.unitPrice, 
        (orderItems.quantity * orderItems.unitPrice) AS subtotal
      FROM 
        orderItems
      JOIN 
        products 
      ON 
        orderItems.productId = products.id
      WHERE 
        orderItems.orderId = ?`;

    db.get(orderQuery, [orderId], (err, order) => {
      if (err) return callback(err);

      if (!order) return callback(new Error("Order not found"));

      db.all(itemsQuery, [orderId], (err, items) => {
        if (err) return callback(err);

        // Generar JSON de la orden
        const orderDetails = {
          id: order.id,
          userId: order.userId,
          username: order.username,
          email: order.email,
          date: order.date,
          status: order.status,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          total: items.reduce((sum, item) => sum + item.subtotal, 0), // Sumar subtotales
        };

        callback(null, orderDetails);
      });
    });
  },
};

module.exports = GameStoreServices;
