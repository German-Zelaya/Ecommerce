// controllers/gameStoreController.js
const GameStoreServices = require("../servicio/gameStoreServices");

const GameStoreController = {
  getProducts: (req, res) => {
    GameStoreServices.getProducts((err, products) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.json(products);
    });
  },

  addToCart: (req, res) => {
    const { userId, productId, quantity } = req.body;
    GameStoreServices.addToCart(
      userId,
      productId,
      quantity,
      (err, cartItemId) => {
        if (err)
          return res.status(500).send("Error al añadir el producto al carrito");
        res
          .status(201)
          .json({ message: "Producto añadido al carrito", cartItemId });
      }
    );
  },

  createOrder: (req, res) => {
    const { userId } = req.body;
    GameStoreServices.createOrder(userId, (err, orderId) => {
      if (err) return res.status(500).send("Error al crear la orden");
      res.status(201).json({ message: "Orden creada con éxito", orderId });
    });
  },

  getOrderDetails: (req, res) => {
    const { orderId } = req.params;
    GameStoreServices.getOrderDetails(orderId, (err, orderDetails) => {
      if (err)
        return res
          .status(500)
          .send("Error al obtener los detalles de la orden");
      res.json(orderDetails);
    });
  },

  getCategories: (req, res) => {
    GameStoreServices.getCategories((err, categories) => {
      if (err) {
        console.error("Error al obtener categorías:", err);
        return res.status(500).send("Error al obtener las categorías");
      }
      console.log("Categorías enviadas:", categories);
      res.json(categories);
    });
  },

  createCategory: (req, res) => {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).send("El nombre de la categoría es obligatorio");
    }
    GameStoreServices.createCategory(
      { name, description, image },
      (err, newCategory) => {
        if (err) {
          console.error("Error al crear categoría:", err);
          return res.status(500).send("Error al crear la categoría");
        }
        res.status(201).json(newCategory);
      }
    );
  },
};

module.exports = GameStoreController;
