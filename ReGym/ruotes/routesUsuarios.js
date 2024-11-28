const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());
// Importación de modelos
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios');

//Ruta para registrar
router.post('/registrar', async (req, res) => {
    const { nombre, correo, password, matricula } = req.body;

    // Determina el modelo de usuario en función de la matrícula
    if (matricula.startsWith('U')) {
        User = Atleta;
    } else if (matricula.startsWith('E')) {
        User = Entrenador;
    } else if (matricula.startsWith('A')) {
        User = Administrador;
    } else {
        return res.status(400).json({ mensaje: "Tipo de usuario desconocido" });
    }

    // Crear y guardar el usuario en la colección correspondiente
    const nuevoUsuario = new User({ nombre, correo, password, matricula });

    try {
        await nuevoUsuario.save();
        return res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ mensaje: 'Error al crear usuario', error });
    }
});

//Ruta para verificar correo y contraseña para inicio de sesion
router.post('/iniciarSesion', async (req, res) => {
    const { correo, password, nombre } = req.body;

    try {
        // Intentar encontrar al usuario en la colección de Atletas
        let usuario = await Atleta.findOne({ correo: correo, password: password });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "atleta", usuario });
        }

        // Intentar encontrar al usuario en la colección de Entrenadores
        usuario = await Entrenador.findOne({ correo: correo, password: password });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "entrenador", usuario });
    
        }

        // Intentar encontrar al usuario en la colección de Administradores
        usuario = await Administrador.findOne({ correo: correo, password: password });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "administrador", usuario });
      } else{// Si el usuario no fue encontrado en ninguna colección
        return res.status(401).json({ mensaje: "Credenciales incorrectas" });
      }
          // Devolver el id y el nombre del usuario en la respuesta 
          return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario, userId: usuario._id, nombre: usuario.nombre });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error en el servidor", error });
    }
    
});

//Ruta para recuperar contraseña:
router.post('/recuperarContrasena', async (req, res) => {
const { correo } = req.body;
console.log("Correo recibido:", correo); // Log para verificar el correo recibido
//return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: usuario.tipoUsuario, usuario: usuario.datos });

try {
    // Intentar encontrar al usuario en la colección de Atletas
    let usuario = await Atleta.findOne({ correo: correo });
    if (usuario) {
        console.log("Usuario encontrado en Atletas:", usuario); // Log para verificar al usuario encontrado
        return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: "atleta", usuario: usuario.datos });
    }

    // Intentar encontrar al usuario en la colección de Entrenadores
    usuario = await Entrenador.findOne({ correo: correo});
    if (usuario) {
        console.log("Usuario encontrado en Entrenadores:", usuario);
        return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: "entrenador", usuario: usuario.datos });
    }

    // Intentar encontrar al usuario en la colección de Administradores
    usuario = await Administrador.findOne({ correo: correo});
    if (usuario) {
        console.log("Usuario encontrado en Administradores:", usuario);
        return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: "administrador", usuario: usuario.datos });
    }

    // Si el usuario no fue encontrado en ninguna colección
    console.log("Usuario no encontrado en ninguna colección.");
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
} catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error en el servidor", error });
}
});

module.exports = router; // Exportar router para utilizarlo en server.js
