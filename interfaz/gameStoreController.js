// controllers/gameStoreController.js
const GameStoreServices = require("../servicio/gameStoreServices");
const UserService = require("../servicio/userService");
const ProductService = require("../servicio/productService");
const moment = require("moment");
const PDFDocument = require("pdfkit");
function calculaDigitoMod11(cadena, numDig, limMult, x10) {
  let mult, suma, i, n, dig;

  if (!x10) numDig = 1;

  for (n = 1; n <= numDig; n++) {
    suma = 0;
    mult = 2;

    for (i = cadena.length - 1; i >= 0; i--) {
      suma += mult * parseInt(cadena.substring(i, i + 1));
      if (++mult > limMult) mult = 2;
    }

    if (x10) {
      dig = ((suma * 10) % 11) % 10;
    } else {
      dig = suma % 11;
    }

    if (dig === 10) {
      cadena += "1";
    } else if (dig === 11) {
      cadena += "0";
    } else if (dig < 10) {
      cadena += dig.toString();
    }
  }

  return cadena.substring(cadena.length - numDig, cadena.length);
}

function obtenerModulo11(pCadena) {
  vDigito = calculaDigitoMod11(pCadena, 1, 9, false);
  console.log(vDigito);
  return vDigito;
}
class StringTools {
  static completeCero(pString, pMaxChar, pRight = false) {
    let vNewString = pString;

    if (pString.length < pMaxChar) {
      while (vNewString.length < pMaxChar) {
        vNewString = pRight ? vNewString + "0" : "0" + vNewString;
      }
    }
    return vNewString;
  }

  static base16(pString) {
    let vValor = BigInt(pString);
    return vValor.toString(16).toUpperCase();
  }

  static base10(pString) {
    let vValor = BigInt("0x" + pString);
    return vValor.toString(10);
  }
}

const GameStoreController = {
  getProducts: (req, res) => {
    GameStoreServices.getProducts((err, products) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.json(products);
    });
  },
  addToCart: (req, res) => {
    const { productId, name, price, quantity } = req.body;

    // Asumimos que el carrito está asociado al usuario en sesión
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
      return res.status(401).send("Usuario no autenticado");
    }

    // Verificar si el carrito ya existe para el usuario
    GameStoreServices.getCart(userId, (err, cart) => {
      if (err) return res.status(500).send("Error al obtener el carrito");
      console.log("Carrito encontrado:", cart[0].id);
      GameStoreServices.addToCart(
        cart[0].id,
        productId,
        quantity || 1, // Por defecto añade una unidad
        price,
        (err) => {
          if (err)
            return res.status(500).send("Error al añadir producto al carrito");
          res.json({ success: true, message: "Producto añadido al carrito" });
        }
      );
    });
  },

  removeFromCart: (req, res) => {
    const { itemId } = req.body;
    GameStoreServices.removeFromCart(itemId, (err) => {
      if (err)
        return res
          .status(500)
          .send("Error al eliminar el producto del carrito");
      res.redirect("/cart");
    });
  },

  // 2. Ver el contenido del carrito
  getCart: (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
      return res.status(401).send("Usuario no autenticado");
    }

    GameStoreServices.getCartItems(userId, (err, cartItems) => {
      if (err) return res.status(500).send("Error al obtener el carrito");
      total = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      res.render("cart", { title: "Carrito", items: cartItems, total });
    });
  },

  // 3. Actualizar la cantidad de un producto en el carrito
  updateCartItem: (req, res) => {
    const { itemId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).send("Cantidad inválida");
    }

    GameStoreServices.updateCartItem(itemId, quantity, (err) => {
      if (err)
        return res
          .status(500)
          .send("Error al actualizar el producto en el carrito");
      res.json({
        success: true,
        message: "Cantidad actualizada correctamente",
      });
    });
  },

  // 4. Eliminar un producto del carrito
  deleteCartItem: (req, res) => {
    const { itemId } = req.body;

    GameStoreServices.deleteCartItem(itemId, (err) => {
      if (err)
        return res
          .status(500)
          .send("Error al eliminar el producto del carrito");
      res.json({ success: true, message: "Producto eliminado del carrito" });
    });
  },

  // 5. Vaciar el carrito
  emptyCart: (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
      return res.status(401).send("Usuario no autenticado");
    }

    GameStoreServices.emptyCartByUserId(userId, (err) => {
      if (err) return res.status(500).send("Error al vaciar el carrito");
      res.json({ success: true, message: "Carrito vaciado correctamente" });
    });
  },

  createOrder: (req, res) => {
    const { userId, items, amount, method } = req.body;
    const itemsJson = items.map((item) => JSON.parse(item));
    GameStoreServices.createOrder(userId, "Pendiente", (err, orderId) => {
      if (err) return res.status(500).send("Error al crear la orden");
      GameStoreServices.addOrderItems(orderId, itemsJson, (err) => {
        if (err) return res.status(500).send("Error al agregar los productos");
        GameStoreServices.addPayment(orderId, amount, method, (err) => {
          if (err) return res.status(500).send("Error al agregar el pago");
          GameStoreServices.emptyCart(userId, (err) => {
            if (err)
              return res
                .status(500)
                .send("Error al vaciar el carrito después de la compra");
            res.redirect(`/`);
          });
        });
      });
    });
  },

  addOrder: (req, res) => {
    const { userId, status, dataProducts, quantity } = req.body;
    const items = dataProducts.map((product, index) => {
      return {
        ...JSON.parse(product),
        quantity: quantity[index],
      };
    });
    GameStoreServices.createOrder(userId, status, (err, orderId) => {
      if (err) return res.status(500).send("Error al crear la orden");
      GameStoreServices.addOrderItems(orderId, items, (err) => {
        if (err) return res.status(500).send("Error al agregar los productos");
        res.redirect(`/orders`);
      });
    });
  },
  getOrdersByUserId: (req, res) => {
    const { id } = req.params;
    GameStoreServices.getOrdersByUserId(id, (err, orders) => {
      if (err) return res.status(500).send("Error al obtener las ordenes");
      res.render("notifications", { title: "Notificaciones", orders });
    });
  },

  getItemsByUserId: (req, res) => {
    const { id } = req.params;
    GameStoreServices.getOrderItems(id, (err, items) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.render("Library", { title: "Mi Biblioteca", items });
    });
  },

  getOrders: (req, res) => {
    GameStoreServices.getOrders((err, orders) => {
      if (err) return res.status(500).send("Error al obtener las ordenes");
      res.render("showOrders", { title: "Gestion de Ordenes", orders });
    });
  },
  getOrder: (req, res) => {
    const { id } = req.params;
    UserService.getUsers((err, users) => {
      if (err) return res.status(500).send("Error al obtener los usuarios");
      ProductService.getProducts((err, products) => {
        if (err) return res.status(500).send("Error al obtener los productos");
        GameStoreServices.getOrder(id, (err, order) => {
          if (err) return res.status(500).send("Error al obtener la orden");
          GameStoreServices.getOrderItems(order.id, (err, items) => {
            if (err)
              return res
                .status(500)
                .send("Error al obtener los productos de la orden");
                console.log( "Items de la orden:", order.userId, items);
                res.render("editOrder", { title: "Editar Orden", order, users, products, items });
          });
        });
      });
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
  getForm: (req, res) => {
    UserService.getUsers((err, users) => {
      if (err) return res.status(500).send("Error al obtener los usuarios");
      ProductService.getProducts((err, products) => {
        if (err) return res.status(500).send("Error al obtener los productos");
        res.render("createOrder", { title: "Crear Orden", users, products });
      });
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
  generateBill: (req, res) => {
    const { id } = req.params;

    GameStoreServices.getOrderDetails(id, (err, orderDetails) => {
      if (err) {
        console.error("Error al obtener los detalles de la orden:", err);
        return res.status(500).send("Error al generar la factura");
      }
// Conseguimos los codigo de la factura
      var nitEmisor = "1400544402";
      const formatDate = (dateString) => {
        return moment(dateString, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDHHmmssSSS");
      };
      var fechaHora = formatDate(orderDetails.date);
      var sucursal = "0";
      var modalidad = "1";
      var tipoEmision = "1";
      var tipoFactura = "1";
      var tipoDocumento = "1";
      var numeroFactura = "" + orderDetails.id;
      var pos = "0";
      console.log("NIT EMISOR:", nitEmisor);
      console.log("FECHA / HORA:", fechaHora);
      console.log("SUCURSAL:", sucursal);
      console.log("MODALIDAD:", modalidad);
      console.log("TIPO EMISIÓN:", tipoEmision);
      console.log("TIPO FACTURA / DOCUMENTO AJUSTE:", tipoFactura);
      console.log("TIPO DOCUMENTO SECTOR:", tipoDocumento);
      console.log("NÚMERO DE FACTURA:", numeroFactura);
      console.log("POS:", pos);
      console.log(
        "---Se completa cada campo según la longitud definida con ceros a la izquierda:---"
      );
      nitEmisor = StringTools.completeCero(nitEmisor, 13);
      fechaHora = StringTools.completeCero(fechaHora, 17);
      sucursal = StringTools.completeCero(sucursal, 4);
      tipoDocumento = StringTools.completeCero(tipoDocumento, 2);
      numeroFactura = StringTools.completeCero(numeroFactura, 10);
      pos = StringTools.completeCero(pos, 4);
      console.log("NIT EMISOR:", StringTools.completeCero(nitEmisor, 13));
      console.log("FECHA / HORA:", StringTools.completeCero(fechaHora, 17));
      console.log("SUCURSAL:", StringTools.completeCero(sucursal, 4));
      console.log("MODALIDAD:", modalidad);
      console.log("TIPO EMISIÓN:", tipoEmision);
      console.log("TIPO FACTURA / DOCUMENTO AJUSTE:", tipoFactura);
      console.log(
        "TIPO DOCUMENTO SECTOR:",
        StringTools.completeCero(tipoDocumento, 2)
      );
      console.log(
        "NÚMERO DE FACTURA:",
        StringTools.completeCero(numeroFactura, 10)
      );
      console.log("POS:", StringTools.completeCero(pos, 4));
      console.log("---Se Concatena los campos:---");
      var codigo =
        nitEmisor +
        fechaHora +
        sucursal +
        modalidad +
        tipoEmision +
        tipoFactura +
        tipoDocumento +
        numeroFactura +
        pos;
      console.log(codigo);
      var codigo11 = codigo + obtenerModulo11(codigo);
      console.log("---Se obtiene el modulo 11:---");
    
      console.log(codigo11);
      console.log("---Se aplica base 16:---");
    
      codigobase16 = StringTools.base16(codigo11);
    
      console.log(codigobase16);
    
      console.log("---Se concatena el codigo de control:---");
      control = "87D7B8EE1D88E74";
      codigocompleto = codigobase16 + control;
      console.log(codigocompleto);

      // Crear un nuevo documento PDF
      const doc = new PDFDocument({ margin: 50 });

  // Configurar las cabeceras para descargar el archivo
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=factura_${id}.pdf`
  );

  // Pipe el contenido del PDF a la respuesta
  doc.pipe(res);

  // Cabecera
  doc
    .fontSize(10)
    .text("NIT: 1400040544", { align: "left" })
    .text("Punto de Venta: 0", { continued: true, align: "left" })
    .text("FACTURA N°:" + id , { align: "right" })
    .text("Casa Matriz", { continued: true, align: "left" })
    .text("COD. AUTORIZACION:" + codigocompleto, { align: "right", bold: true, width: 400 })
    .moveDown();

  // Título
  doc
    .fontSize(20)
    .text(`Factura`, { align: "center" })
    .moveDown();

  doc
    .fontSize(10)
    .text(`(Con derecho a credito fiscal)`, { align: "center" })
    .moveDown();

  // Información del cliente
  doc
    .fontSize(12)
    .text(`Cliente: ${orderDetails.username}`)
    .text(`Email: ${orderDetails.email}`)
    .text(`Fecha: ${orderDetails.date}`)
    .moveDown();
    
  // Tabla de productos
  doc
    .fontSize(14)
    .text("Detalles de la orden:", { underline: true })
    .moveDown(0.5);

  // Dibujar cabecera de la tabla
  const tableTop = 222; // Guardar la posición inicial
  const columnWidths = [40, 200, 100, 100, 100];

  doc
    .fontSize(14)
    .text("N°", { continued: true, align: "left" })
    .text("              Producto", { continued: true, align: "left" })
    .text("              Cantidad", { continued: true, align: "left" })
    .text("              Precio Unit.", { continued: true, align: "left" })
    .text("              Subtotal", {  align: "left" });

  doc.moveDown(0.5);

  // Dibujar filas de la tabla
  orderDetails.items.forEach((item, index) => {
    doc
      .fontSize(10)
      .text(`${index + 1}`, { continued: true, align: "left" })
      .text(`                         ${item.name}`, { continued: true, align: "left" })
      .text(`                         ${item.quantity}`, { continued: true, align: "left" })
      .text(`                         $${item.unitPrice.toFixed(2)}`, { continued: true, align: "left" })
      .text(`                         $${item.subtotal.toFixed(2)}`, { align: "right" });
  });

  doc.moveDown(2);

  // Total
  doc
    .fontSize(14)
    .text(`Total a pagar: $${orderDetails.total.toFixed(2)}`, { align: "right" });

  doc
    .fontSize(10)
    .text(`ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY`, { align: "center" })
    .moveDown();
  doc
    .fontSize(10)
    .text(`Ley N° 453: Los contratos de adhesión deben redactarse en términos claros, comprensibles, legibles y deben informar todas las facilidades y limitaciones.`, { align: "center" })
    .moveDown();
  doc
    .fontSize(10)
    .text(`Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea`, { align: "center" })
    .moveDown();
  // Finalizar el documento
  doc.end();
    });
  },
};

module.exports = GameStoreController;
