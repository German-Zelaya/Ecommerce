const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión exitosa a la base de datos.");
  }
});

db.run('ALTER TABLE users ADD COLUMN rol INTEGER DEFAULT 0')
db.run("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''")

db.close((err) => {
  if (err) {
    console.error("Error al cerrar la conexión:", err.message);
  } else {
    console.log("Conexión cerrada.");
  }
});
