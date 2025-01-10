const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { Atleta, Entrenador, Administrador } = require('../models/modelosUsuarios');
const { MatriculasCompartidas} = require('../models/modelosUsuarios');

// Ruta para registrar
router.post('/registrar', async (req, res) => {
    const { id, nombre, correo, contraseña, matricula } = req.body;

    // Verificar si la matrícula está en la lista de matrículas disponibles
    try {
        const matriculas = await MatriculasCompartidas.findOne();
        if (!matriculas || !matriculas.matriculas || matriculas.matriculas.length === 0) {
            return res.status(400).json({ mensaje: "No se encuentran matrículas disponibles." });
        }

        console.log("Usuario:", req.body);

        // Comprobar si la matrícula ya está en la lista de matrículas disponibles
        if (!matriculas.matriculas.includes(matricula)) {
            return res.status(400).json({ mensaje: "La matrícula no está disponible." });
        }

        // Determinar el modelo de usuario en función de la matrícula
        let User;
        switch (true) {
            case matricula.startsWith('U'):
                User = Atleta;
                break;
            case matricula.startsWith('E'):
                User = Entrenador;
                break;
            case matricula.startsWith('A'):
                User = Administrador;
                break;
            default:
                return res.status(400).json({ mensaje: "Tipo de usuario desconocido" });
        }

        // Crear y guardar el usuario en la colección correspondiente
        const nuevoUsuario = new User({ nombre, correo, contraseña, matricula });

        await nuevoUsuario.save();

        // Eliminar la matrícula de la lista de disponibles
        const matriculaIndex = matriculas.matriculas.indexOf(matricula);
        if (matriculaIndex > -1) {
            matriculas.matriculas.splice(matriculaIndex, 1); // Eliminar la matrícula de la lista
        }

        // Guardar la lista de matrículas actualizada en la base de datos
        await matriculas.save();  // Guardar la lista actualizada

        // Responder con el usuario creado
        res.status(201).json({
            id: nuevoUsuario._id,  // Renombrar _id a id
            nombre: nuevoUsuario.nombre,
            correo: nuevoUsuario.correo,
            matricula: nuevoUsuario.matricula
        });

        console.log("Respuesta enviada:", {
            id: nuevoUsuario._id,
            nombre: nuevoUsuario.nombre,
            correo: nuevoUsuario.correo,
            matricula: nuevoUsuario.matricula
        });

    } catch (error) {
        console.error("Error al guardar el usuario:", error);
        res.status(500).json({ mensaje: "Error al guardar el usuario", error });
    }
});

// Ruta para verificar correo y contraseña para inicio de sesion
router.post('/iniciarSesion', async (req, res) => {
    const { correo, contraseña, nombre } = req.body;
    console.log("Usuario:", req.body);

    try {

        // Intentar encontrar al usuario en la colección de Atletas
        let usuario = await Atleta.findOne({ correo: correo, contraseña: contraseña });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "atleta", usuario });
        }

        // Intentar encontrar al usuario en la colección de Entrenadores
        usuario = await Entrenador.findOne({ correo: correo, contraseña: contraseña });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "entrenador", usuario });
    
        }

        // Intentar encontrar al usuario en la colección de Administradores
        usuario = await Administrador.findOne({ correo: correo, contraseña: contraseña });
        console.log("adm",correo, contraseña );
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "administrador", usuario });
      } 
      else{// Si el usuario no fue encontrado en ninguna colección
        return res.status(401).json({ mensaje: "Credenciales incorrectas" });
      }
          // Devolver el id y el nombre del usuario en la respuesta 
          return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario, userId: usuario._id, nombre: usuario.nombre });
        
    } catch (error) {
        
        console.error(error);
        return res.status(500).json({ mensaje: "Error en el servidor", error });
    }
    
});

// Ruta para recuperar contraseña:
router.post('/recuperarContrasena', async (req, res) => {
    const { correo } = req.body;
    console.log("Correo recibido:", correo); // Log para verificar el correo recibido

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

        return res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

module.exports = router; // Exportar router para utilizarlo en server.js
