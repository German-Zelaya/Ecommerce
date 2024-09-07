// models/gameStoreModels.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión exitosa a la base de datos.");
  }
});

db.serialize(() => {
  // Tabla de usuarios (extendida)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    updateAt DATETIME,
    image TEXT,
    rol TEXT DEFAULT 'user'
  )`);

  // Tabla de productos (videojuegos)
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT,
    updateAt DATETIME,
    thumbnail TEXT,
    image1 TEXT,
    image2 TEXT
  )`);

  // Tabla de carritos
  db.run(`CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  // Tabla de items del carrito
  db.run(`CREATE TABLE IF NOT EXISTS cartItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cartId INTEGER,
    productId INTEGER,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (cartId) REFERENCES carts(id),
    FOREIGN KEY (productId) REFERENCES products(id)
  )`);

  // Tabla de órdenes
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    date DATETIME,
    status TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  // Tabla de items de la orden
  db.run(`CREATE TABLE IF NOT EXISTS orderItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER,
    productId INTEGER,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id),
    FOREIGN KEY (productId) REFERENCES products(id)
  )`);

  // Tabla de pagos
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER,
    amount REAL NOT NULL,
    date DATETIME,
    method TEXT,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  )`);

  // Tabla de categorías
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    updateAt DATETIME
  )`);
});

// Aquí irían los modelos para cada tabla...

module.exports = {
  db,
  // Exportar los modelos cuando los creemos
};