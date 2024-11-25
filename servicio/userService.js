// servicio/userService.js
const e = require("express");
const UserModel = require("../modelo/userModel");
const bcrypt = require("bcryptjs");

const UserService = {
  register: (username, email, password, callback) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return callback(err);
      }
      const newUser = { username, email, password: hashedPassword, rol: 0 };
      UserModel.create(newUser, callback);
    });
  },

  login: (username, password, callback) => {
    UserModel.findByUsername(username, (err, user) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
        return callback(err);
      }

      if (!user) {
        return callback(null, false); // Usuario no encontrado
      }

      // Verificar contraseña
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Error al comparar contraseñas:", err);
          return callback(err);
        }

        if (!isMatch) {
          return callback(null, false); // Contraseña incorrecta
        }

        // Usuario autenticado correctamente
        callback(null, user);
      });
    });
  },
  // Nuevo método para crear un usuario
  createUser: (userData, callback) => {
    const { username, email, password, rol } = userData;
    if (!username || !password || !rol) {
      const error = new Error("Todos los campos son obligatorios");
      console.error("Error: Faltan datos de entrada", {
        username,
        email,
        password,
        rol,
      });
      return callback(error);
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error al hashear la contraseña:", err);
        return callback(err);
      }
      const newUser = { username, email, password: hashedPassword, rol };
      UserModel.create(newUser, (err, result) => {
        if (err) {
          console.error("Error al crear el usuario:", err);
          return callback(err);
        }
        console.log("Usuario creado con ID:", result.id);
        callback(null, result);
      });
    });
  },
  updateUser: (userId, user, callback) => {
    UserModel.update(userId, user, (err, result) => {
      if (err) {
        console.error("Error al actualizar el usuario:", err);
        return callback(err);
      }
      console.log("Usuario actualizado con ID:", userId);
      callback(null, result);
    });
  },
  deleteUser: (userId, callback) => {
    UserModel.delete(userId, callback);
  },
  getUser: (userId, callback) => {
    UserModel.findById(userId, callback);
  },
  // Nuevo método para obtener todos los usuarios
  getUsers: (callback) => {
    UserModel.findAll(callback);
  },
};

module.exports = UserService;
