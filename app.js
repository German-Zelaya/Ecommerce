const express = require("express");
const path = require("path");
const UserController = require("./interfaz/userController");
const GameStoreController = require("./interfaz/gameStoreController");
const productController = require("./interfaz/productController");
const multer = require("multer");

const app = express();

const expressLayouts = require("express-ejs-layouts");

app.use(expressLayouts);
// Configuracion de multer para las imagenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
// Configuracion de session
const session = require("express-session");
const { title } = require("process");

app.use(
  session({
    secret: "LAst_G0d", // Cambia esto por una cadena segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Configuracion de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
// configuracion del layout
app.set("layout", "layout");

app.use(async (req, res, next) => {
  try {
    const categories = await productController.getCategories();
    res.locals.categories = categories;
    next();
  } catch (err) {
    console.error("Error al cargar categorías:", err);
    res.locals.categories = [];
    next();
  }
});
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user; // Asignar datos de sesión a res.locals
  } else {
    res.locals.user = null; // Si no hay usuario en la sesión
  }
  next();
});

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.rol === 1) {
    return next();
  }
  res.redirect("/");
};

// Ruta al index
app.get("/", isAuthenticated, productController.index);
// Ruta a las categorias
app.get("/category/:id", isAuthenticated, productController.getProductsByCategory);
// Ruta al detalle de un producto
app.get("/product/:id", isAuthenticated, productController.product);
// Ruta de busqueda
app.post("/search", isAuthenticated, productController.search);
// Configuracion para la sesion
app.get("/login", (req, res) => {
  res.render("login", { layout: false });
});
app.post("/login", UserController.login);

app.get("/register", (req, res) => {
  res.render("register", { layout: false });
});

app.post("/register", UserController.register);

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).send("No se pudo cerrar la sesión");
    }

    res.redirect("/login");
  });
});

app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  } else {
    res.locals.user = null;
  }
  next();
});

// Rutas para Gestion de Productos

app.get("/products", isAuthenticated, isAdmin, productController.read); // Tabla de productos
app.get("/api/createProduct", isAuthenticated, isAdmin, productController.form); // Formulario Create
app.get("/api/editProduct/:id", isAuthenticated, isAdmin, productController.get); // Formulario Update
app.post(
  "/api/editProduct/:id",
  isAuthenticated, isAdmin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]), productController.update
); // Ruta para actualizar el producto
app.post(
  "/api/createproduct",
  isAuthenticated, isAdmin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]), productController.create
); // Ruta para crear el producto

app.post("/api/deleteProduct/:id", isAuthenticated, isAdmin, productController.delete); // Ruta para borrar el producto

// Rutas para Gestion de Usuarios

app.get("/users", isAuthenticated, isAdmin, UserController.read);
app.get("/api/createUser", isAuthenticated, isAdmin, UserController.form); // Formulario Create
app.get("/api/editUser/:id", isAuthenticated, isAdmin, UserController.get); // Formulario Update
app.post("/api/editUser/:id", isAuthenticated, isAdmin, UserController.update); // Ruta para actualizar el usuario
app.post("/api/createUser", isAuthenticated, isAdmin, UserController.createUser); // Ruta para crear un usuario
app.post("/api/deleteUser/:id", isAuthenticated, isAdmin, UserController.delete); // Ruta para borrar el usuario

// Rutas para Gestión de Ordenes

app.get("/orders", isAuthenticated, isAdmin, GameStoreController.getOrders);
app.get("/api/createOrder", isAuthenticated, isAdmin, GameStoreController.getForm);
app.get("/api/editOrder/:id", isAuthenticated, isAdmin, GameStoreController.getOrder);
app.post("/api/editOrder/:id", isAuthenticated, isAdmin, GameStoreController.updateOrder);
app.post("/api/createOrder", isAuthenticated, isAdmin, GameStoreController.addOrder);
app.post("/api/deleteOrder/:id", isAuthenticated, isAdmin, GameStoreController.deleteOrder);

// Ruta para el carrito de compras
app.get("/cart", isAuthenticated, isAdmin, GameStoreController.getCart);
app.post("/cart/add", isAuthenticated, isAdmin, GameStoreController.addToCart);
app.post("/cart/remove", isAuthenticated, isAdmin, GameStoreController.removeFromCart);

// Ruta para las ordenes
app.post("/api/order", isAuthenticated, isAdmin, GameStoreController.createOrder);
app.get(
  "/notifications/:id",
  isAuthenticated, isAdmin,
  GameStoreController.getOrdersByUserId
);

// Ruta para generar la factura
app.get("/Bill/:id", isAuthenticated, isAdmin, GameStoreController.generateBill);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
