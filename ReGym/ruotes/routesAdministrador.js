const express = require('express');
const router = express.Router();
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios');
const { Comentario} = require('../Models/modelosComentarios');

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const administradores = await Administrador.find();
    const entrenadores = await Entrenador.find();
    const atletas = await Atleta.find();

    const todosLosUsuarios = [
        ...administradores.map(user => ({ 
          id: user._id,  // Incluimos el _id de cada modelo
          nombre: user.nombre,
          correo: user.correo,
          matricula: user.matricula,
          password: user.password  // Indicamos el tipo de usuario
        })),
        ...entrenadores.map(user => ({ 
          id: user._id,  // Incluimos el _id de cada modelo
          nombre: user.nombre,
          correo: user.correo,
          matricula: user.matricula,
          password: user.password 
        })),
        ...atletas.map(user => ({ 
          id: user._id,  // Incluimos el _id de cada modelo
          nombre: user.nombre,
          correo: user.correo,
          matricula: user.matricula,
          password: user.password 
        })),
     ];
     

    res.status(200).json(todosLosUsuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});


// Ruta para eliminar usuario
router.delete('/usuarios/eliminar/:matricula/:usuarioId', async (req, res) => {
    const { matricula, usuarioId } = req.params;

    try {
        const usuarioEliminado =
            (await Atleta.findOneAndDelete({ matricula })) ||
            (await Entrenador.findOneAndDelete({ matricula })) ||
            (await Administrador.findOneAndDelete({ matricula }));

        if (!usuarioEliminado) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Eliminar los comentarios asociados al usuario
        await Comentario.deleteMany({ usuario_id: usuarioId });

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


// Ruta para obtener comentarios por movimiento_id
router.get('/comentarios/:movimiento/:usuarioId', async (req, res) => {
    const { movimiento, usuarioId } = req.params; // Extrae los parámetros de la URL
    
    // Verifica que el movimiento sea válido
    const letrasValidas = ['P', 'S', 'B', 'V'];
    if (!letrasValidas.includes(movimiento)) {
        return res.status(400).json({ error: 'La letra del movimiento no es válida. Debe ser P, S, B o V.' });
    }

    try {
        console.log('Consultando base de datos para la letra inicial del movimiento:', movimiento, 'y usuarioId:', usuarioId);
        
        // Filtrar por la primera letra del campo 'movimiento' y el usuarioId
        const comentarios = await Comentario.find({ 
            movimiento: { $regex: `^${movimiento}`, $options: 'i' }, // Filtra por primera letra (no distingue mayúsculas/minúsculas)
            usuario_id: usuarioId // Filtra por usuarioId
        });

        if (!comentarios || comentarios.length === 0) {
            return res.status(404).json({ error: 'No se encontraron comentarios para este movimiento y usuario' });
        }

        console.log('Comentarios encontrados: ', comentarios.length);
        return res.status(200).json(comentarios);
    } catch (error) {
        console.error("Error al obtener los comentarios:", error);
        return res.status(500).json({ error: "Error al obtener los comentarios", message: error.message });
    }
});

module.exports = router; // Exportar router para utilizarlo en server.js
