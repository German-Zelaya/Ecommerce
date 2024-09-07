// servicio/userService.js
const UserModel = require("../modelo/userModel");
const bcrypt = require("bcryptjs");

const UserService = {
  register: (username, password, callback) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return callback(err);
      }
      const newUser = { username, password: hashedPassword };
      UserModel.create(newUser, callback);
    });
  },

  authenticate: (username, password, callback) => {
    UserModel.findByUsername(username, (err, user) => {
      if (err) return callback(err);
      if (!user) return callback(null, false);

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch ? user : false);
      });
    });
  },

  // Nuevo método para crear un usuario
  createUser: (username, password, callback) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return callback(err);
      }
      const newUser = { username, password: hashedPassword };
      UserModel.create(newUser, callback);
    });
  },

  // Nuevo método para obtener todos los usuarios
  getUsers: (callback) => {
    UserModel.findAll(callback);
  }
};

module.exports = UserService;
