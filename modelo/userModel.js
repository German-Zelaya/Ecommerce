const { update } = require("../interfaz/productController");

// modelo/userModel.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión exitosa a la base de datos.");
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);
});

const UserModel = {
  create: (user, callback) => {
    const query =
      "INSERT INTO users (username, password, rol, email) VALUES (?, ?, ?, ?)";
    db.run(
      query,
      [user.username, user.password, user.rol, user.email],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, this.lastID);
      }
    );
  },
  update: (id, user, callback) => {
    const query =
      "UPDATE users SET username = ?, password = ?, rol = ?, email = ? WHERE id = ?";
    db.run(
      query,
      [user.username, user.password, user.rol, user.email, id],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, this.changes);
      }
    );
  },
  delete: (id, callback) => {
    const query = "DELETE FROM users WHERE id = ?";
    db.run(query, [id], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    });
  },
  findById: (id, callback) => {
    const query = "SELECT * FROM users WHERE id = ?";
    db.get(query, [id], (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    });
  },

  findByUsername: (username, callback) => {
    const query = "SELECT * FROM users WHERE username = ?";
    db.get(query, [username], (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    });
  },

  // Nuevo método para obtener todos los usuarios
  findAll: (callback) => {
    const query = "SELECT * FROM users";
    db.all(query, [], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  },
};

module.exports = UserModel;
