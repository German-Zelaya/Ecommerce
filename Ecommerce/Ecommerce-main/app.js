const express = require("express");
const path = require("path");
const UserController = require("./interfaz/userController");
const GameStoreController = require("./interfaz/gameStoreController");
const productController = require("./interfaz/productController");
const multer = require("multer");

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Nombre único para cada imagen
  },
});

const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "interfaz"));

app.use(express.static(path.join(__dirname, "interfaz")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

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

app.get("/", (req, res) => {
  res.render("index"); // Renderiza la página index.ejs
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", UserController.login);
app.post("/register", UserController.register);

// Nueva ruta para la tienda
app.get("/store", authenticateUser, (req, res) => {
  res.render("store");
});

app.get("/api/createProduct", productController.form);

app.get("/api/editProduct/:id", productController.get); // Ruta para editar producto
app.post(
  "/api/editProduct/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  productController.update
); // Ruta para actualizar el producto

app.post("/api/deleteProduct/:id", productController.delete);

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
app.get("/products", productController.read);
app.post(
  "/api/createproduct",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  productController.create
);

// Nuevas rutas para interactuar con usuarios
app.post("/api/users", UserController.createUser); // Ruta para crear un usuario
app.get("/api/users", UserController.getUsers); // Ruta para obtener todos los usuarios

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
