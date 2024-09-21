const express = require("express");
const path = require("path");
const UserController = require("./interfaz/userController");
const GameStoreController = require("./interfaz/gameStoreController");
const productController = require("./interfaz/productController");

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

app.get("/createProduct", (req, res) => {
  res.render("createProduct");
});

app.get("/editProduct", (req, res) => {
  res.render("editProduct");
});

app.get("/deleteProduct", (req, res) => {
  res.render("deleteProduct");
});

// Rutas de la API protegidas
app.post("/api/cart/add", authenticateUser, GameStoreController.addToCart);
app.post("/api/orders", authenticateUser, GameStoreController.createOrder);
app.get(
  "/api/orders/:orderId",
  authenticateUser,
  GameStoreController.getOrderDetails
);
app.get("/api/categories", GameStoreController.getCategories);
app.post("/api/categories", GameStoreController.createCategory);
app.get("/api/products", productController.read);
app.post("/api/createproduct", productController.create);
app.post("/api/editproduct", productController.update);
app.post("/api/deleteproduct", productController.delete);

// Nuevas rutas para interactuar con usuarios
app.post("/api/users", UserController.createUser); // Ruta para crear un usuario
app.get("/api/users", UserController.getUsers); // Ruta para obtener todos los usuarios

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
