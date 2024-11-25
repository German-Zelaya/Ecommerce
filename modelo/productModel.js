const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión exitosa a la base de datos.");
  }
});

db.serialize(() => {
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
      image2 TEXT,
      size TEXT,
      classification TEXT
    )`);
});

module.exports = db;
