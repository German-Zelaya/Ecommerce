const UserService = require("../servicio/userService");

const UserController = {
  read: (req, res) => {
    UserService.getUsers((err, users) => {
      if (err) return res.status(500).send("Error al obtener los productos");
      res.render("showUsers", { title: "Gestion de Usuarios", users });
    });
  },
  form: (req, res) => {
    res.render("createUser", { title: "Crear Usuario" });
  },
  get: (req, res) => {
    const { id } = req.params;
    UserService.getUser(id, (err, user) => {
      if (err) return res.status(500).send("Error al obtener el producto");
      res.render("editUser", { title: "Editar Producto", user });
    });
  },
  update: (req, res) => {
    const { id } = req.params;
    const { username, email, password, rol } = req.body;
    UserService.updateUser(
      id,
      { username, email, password, rol },
      (err, user) => {
        if (err) return res.status(500).send("Error al actualizar el producto");
        res.redirect("/users");
      }
    );
  },
  delete: (req, res) => {
    const { id } = req.params;
    UserService.deleteUser(id, (err) => {
      if (err) return res.status(500).send("Error al eliminar el producto");
      res.redirect("/users");
    });
  },
  login: (req, res) => {
    const { username, password } = req.body;

    UserService.login(username, password, (err, user) => {
      if (err) {
        console.error("Error al iniciar sesión:", err);
        return res.status(500).send("Error al iniciar sesión");
      }

      if (!user) {
        return res.status(401).send("Credenciales incorrectas");
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        rol: user.rol,
        email: user.email,
      };

      res.redirect("/"); // Redirigir a una página después del inicio de sesión
    });
  },

  register: (req, res) => {
    const { username, email, password } = req.body;
    UserService.register(username, email, password, (err) => {
      if (err) return res.status(500).send("Error al registrar usuario");
      res.redirect("/");
    });
  },

  // Nuevo método para crear un usuario a través de una API
  createUser: (req, res) => {
    const { username, email, password, rol } = req.body;
    UserService.createUser(
      { username, email, password, rol },
      (err, userId) => {
        if (err) return res.status(500).send("Error al crear usuario");
        res.redirect(`/users`);
      }
    );
  },

  // Nuevo método para obtener todos los usuarios
  getUsers: (req, res) => {
    UserService.getUsers((err, users) => {
      if (err) return res.status(500).send("Error al obtener usuarios");
      res.json(users);
    });
  },
};

module.exports = UserController;
