const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

// Ruta para crear usuario
router.post('/usuarios', controllers.crearUsuario);

module.exports = router;

