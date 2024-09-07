const UserService = require("../servicio/userService");

const UserController = {
  login: (req, res) => {
    const { username, password } = req.body;
    UserService.authenticate(username, password, (err, user) => {
      if (err) return res.status(500).send("Error en el servidor");
      if (!user) return res.status(400).send("Credenciales inválidas");
      
      // Aquí normalmente establecerías una sesión para el usuario
      // Por simplicidad, solo pasaremos el userId como parámetro
      res.redirect(`/store?userId=${user.id}`);
    });
  },

  register: (req, res) => {
    const { username, password } = req.body;
    UserService.register(username, password, (err) => {
      if (err) return res.status(500).send("Error al registrar usuario");
      res.send("Usuario registrado con éxito");
    });
  },

  // Nuevo método para crear un usuario a través de una API
  createUser: (req, res) => {
    const { username, password } = req.body;
    UserService.createUser(username, password, (err, userId) => {
      if (err) return res.status(500).send("Error al crear usuario");
      res.status(201).json({ id: userId, username });
    });
  },

  // Nuevo método para obtener todos los usuarios
  getUsers: (req, res) => {
    UserService.getUsers((err, users) => {
      if (err) return res.status(500).send("Error al obtener usuarios");
      res.json(users);
    });
  }
};

module.exports = UserController;
