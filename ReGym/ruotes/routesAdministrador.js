const express = require('express');
const router = express.Router();
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios');

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const administradores = await Administrador.find();
    const entrenadores = await Entrenador.find();
    const atletas = await Atleta.find();

    const todosLosUsuarios = [
      ...administradores.map(user => ({ ...user.toObject(), tipo: 'Administrador' })),
      ...entrenadores.map(user => ({ ...user.toObject(), tipo: 'Entrenador' })),
      ...atletas.map(user => ({ ...user.toObject(), tipo: 'Atleta' })),
    ];

    res.status(200).json(todosLosUsuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});


// Ruta para eliminar usuario
router.delete('/usuarios/eliminar/:matricula', async (req, res) => {
    const { matricula } = req.params;

    try {
        const usuarioEliminado =
            (await Atleta.findOneAndDelete({ matricula })) ||
            (await Entrenador.findOneAndDelete({ matricula })) ||
            (await Administrador.findOneAndDelete({ matricula }));

        if (!usuarioEliminado) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
});

// Ruta para editar usuario
router.put('/usuarios/editar/:matriculaAux', async (req, res) => {
    const { matriculaAux } = req.params;  // La matrícula antigua que recibimos por params
    const { matricula, nombre } = req.body;  // La nueva matrícula y el nombre que recibimos por el body

    console.log("Datos recibidos:", matriculaAux, matricula, nombre);

    // Primero, intenta actualizar al usuario en el modelo 'Entrenador' usando la matrícula antigua (matriculaAux)
    let usuarioActualizado = await Entrenador.findOneAndUpdate(
        { matricula: matriculaAux },  // Buscar por la matrícula antigua
        { matricula: matricula, nombre: nombre },  // Actualizar la matrícula y el nombre
        { new: true }  // Retorna el documento actualizado
    );

    // Si no se encuentra en 'Entrenador', intenta con 'Atleta'
    if (!usuarioActualizado) {
        usuarioActualizado = await Atleta.findOneAndUpdate(
            { matricula: matriculaAux },  // Buscar por la matrícula antigua
            { matricula: matricula, nombre: nombre },  // Actualizar la matrícula y el nombre
            { new: true }
        );
    }

    // Si no se encuentra en 'Atleta', intenta con 'Administrador'
    if (!usuarioActualizado) {
        usuarioActualizado = await Administrador.findOneAndUpdate(
            { matricula: matriculaAux },  // Buscar por la matrícula antigua
            { matricula: matricula, nombre: nombre },  // Actualizar la matrícula y el nombre
            { new: true }
        );
    }

    // Si no se encuentra el usuario en ninguno de los modelos
    if (!usuarioActualizado) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si se actualiza correctamente, devuelve el usuario actualizado
    res.status(200).json(usuarioActualizado);
    console.log("Usuario actualizado:", usuarioActualizado);
});


/*
// Listar comentarios
router.get('/comentarios', async (req, res) => {
    try {
        const comentarios = await Comentario.find().populate('usuario_id', 'nombre');
        res.status(200).json(comentarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comentarios', error });
    }
});

// Editar comentario
router.put('/comentarios/editar/:comentario_id', async (req, res) => {
    const { comentario_id } = req.params;
    const { comentario } = req.body;

    try {
        const comentarioActualizado = await Comentario.findOneAndUpdate(
            { comentario_id },
            { comentario },
            { new: true }
        );

        if (!comentarioActualizado) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        res.status(200).json({ message: 'Comentario actualizado exitosamente', comentarioActualizado });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar comentario', error });
    }
});

// Eliminar comentario
router.delete('/comentarios/eliminar/:comentario_id', async (req, res) => {
    const { comentario_id } = req.params;

    try {
        const comentarioEliminado = await Comentario.findOneAndDelete({ comentario_id });

        if (!comentarioEliminado) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        res.status(200).json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar comentario', error });
    }
});
// Verificar matrícula existente
router.get('/usuarios/verificar/:matricula', async (req, res) => {
    const { matricula } = req.params;

    try {
        const usuario =
            (await Atleta.findOne({ matricula })) ||
            (await Entrenador.findOne({ matricula })) ||
            (await Administrador.findOne({ matricula }));

        if (!usuario) {
            return res.status(404).json({ message: 'Matrícula no encontrada' });
        }

        res.status(200).json({ message: 'Matrícula válida', usuario });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar matrícula', error });
    }
});
*/ 
module.exports = router; // Exportar router para utilizarlo en server.js
