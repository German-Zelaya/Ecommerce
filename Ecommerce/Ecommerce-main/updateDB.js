const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite");
const db2 = new sqlite3.Database("./db2.sqlite");

db2.all("SELECT * FROM products", (err, rows) => {
  if (err) {
    console.error("Error al leer datos:", err);
    return;
  }

  rows.forEach((row) => {
    db.run(
      "INSERT INTO products (id, code, name, price, stock, description, updateAt, thumbnail, image1, image2, size, classification, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        row.id,
        row.code,
        row.name,
        row.price,
        row.stock,
        row.description,
        row.updateAt,
        row.thumbnail,
        row.image1,
        row.image2,
        row.size,
        row.classification,
        row.category_id,
      ],
      (err) => {
        if (err) console.error("Error al insertar datos:", err);
      }
    );
  });

  console.log("Datos copiados con éxito.");
});
