const express = require("express");
const path = require("path");
const UserController = require("./interfaz/userController");
const GameStoreController = require("./interfaz/gameStoreController");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "interfaz"));

app.use(express.static(path.join(__dirname, "interfaz")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar autenticación
const authenticateUser = (req, res, next) => {
  const userId = req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(401).send("Usuario no autenticado");
  }
  // Aquí normalmente verificarías la sesión del usuario
  // Por simplicidad, solo pasamos el userId
  req.userId = userId;
  next();
};

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", UserController.login);
app.post("/register", UserController.register);

// Nueva ruta para la tienda
app.get("/store", authenticateUser, (req, res) => {
  res.render("store");
});

// Rutas de la API protegidas
app.get("/api/products", authenticateUser, GameStoreController.getProducts);
app.post("/api/cart/add", authenticateUser, GameStoreController.addToCart);
app.post("/api/orders", authenticateUser, GameStoreController.createOrder);
app.get("/api/orders/:orderId", authenticateUser, GameStoreController.getOrderDetails);
app.get('/api/categories', GameStoreController.getCategories);
app.post('/api/categories', GameStoreController.createCategory);

// Nuevas rutas para interactuar con usuarios
app.post("/api/users", UserController.createUser); // Ruta para crear un usuario
app.get("/api/users", UserController.getUsers); // Ruta para obtener todos los usuarios

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});