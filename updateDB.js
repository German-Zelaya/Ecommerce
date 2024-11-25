const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite");
const db2 = new sqlite3.Database("./db2.sqlite");

db2.all("SELECT * FROM products", (err, rows) => {
  if (err) {
    console.error("Error al obtener productos de db2:", err);
    return;
  }

  console.log("Productos obtenidos:", rows);

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    let pendingInserts = rows.length; // Contador para las inserciones

    if (pendingInserts === 0) {
      // Si no hay filas, simplemente finaliza
      db.run("COMMIT");
      db.close();
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
          if (err) {
            console.error("Error al insertar producto:", err);
          }

          // Decrementar el contador y verificar si todas las inserciones han terminado
          pendingInserts--;
          if (pendingInserts === 0) {
            db.run("COMMIT", (err) => {
              if (err) {
                console.error("Error al realizar commit:", err);
              } else {
                console.log("Transacción completada correctamente.");
              }
              db.close((closeErr) => {
                if (closeErr) {
                  console.error("Error al cerrar la base de datos:", closeErr.message);
                } else {
                  console.log("Base de datos cerrada correctamente.");
                }
              });
            });
          }
        }
      );
    });
  });
});
