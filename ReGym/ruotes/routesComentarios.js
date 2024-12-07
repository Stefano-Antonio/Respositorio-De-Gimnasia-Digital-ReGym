const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Comentario} = require('../Models/modelosComentarios');
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios');

router.use(bodyParser.json());

// Ruta para crear un comentario
router.post('/', async (req, res) => {
    const {  usuario_id, nombre, comentario, movimiento, comentario_id} = req.body;

    try {
        // Validar usuario_id
        if (!mongoose.Types.ObjectId.isValid(usuario_id)) {
            return res.status(400).json({ error: 'ID de usuario no válido' });
        }

        // Convertir usuario_id a ObjectId
        const usuarioObjectId = new mongoose.Types.ObjectId(usuario_id);

        // Verificar si el usuario existe en alguna de las colecciones
        let usuario = await Atleta.findById(usuarioObjectId) ||
                        await Entrenador.findById(usuarioObjectId) ||
                        await Administrador.findById(usuarioObjectId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Crear un nuevo comentario
        const nuevoComentario = new Comentario({
            comentario_id,
            usuario_id: usuarioObjectId,
            nombre,
            comentario,
            movimiento,  
            num_likes: 0,
            respuestas: []
        });

        // Guardar el comentario en la base de datos
        const comentarioGuardado = await nuevoComentario.save();

        // Devuelves el comentario guardado con su _id (comentario_id)
        return res.status(201).json({
            mensaje: "Comentario guardado exitosamente",
            comentarioId: nuevoComentario._id.toString(), 
            num_likes: nuevoComentario.num_likes,
            comentario: comentarioGuardado
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al guardar el comentario", message: error.message });
    }
});

// Ruta para obtener comentarios por movimiento_id
router.get('/:movimiento', async (req, res) => {
        const { movimiento } = req.params;

        // Agregar log para verificar los valores recibidos console.
        console.log('Recibido movimiento_id:', movimiento);
        try {

            console.log('Consultando base de datos para movimiento:', movimiento);
            const comentarios = await Comentario.find({ movimiento });
            
            console.log('Comentarios encontrados:', comentarios);

            if (!comentarios || comentarios.length === 0) {
                return res.status(404).json({ error: 'No se encontraron comentarios para este movimiento' });
            }

            console.log('Comentarios encontrados: ', comentarios.length);
            return res.status(200).json(comentarios);
        } catch (error) {
            console.error("Error al obtener los comentarios:", error);
            return res.status(500).json({ error: "Error al obtener los comentarios", message: error.message });
        }
        });

// Ruta para manejar los likes de los comentarios
router.post('/likeComentario', async (req, res) => {
    const { comentarioId, usuarioId, isLiked } = req.body;

    try {
        console.log("Procesando like para comentario:", req.body);

        // Buscar el comentario por ID
        const comentario = await Comentario.findOne({ comentario_id: comentarioId.trim() });
        
        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }
        
        console.log("Comentario encontrado. Estado inicial: num_likes=", comentario.num_likes,"usuario guardado con:", usuarioId);

        // Verificar si el usuario ya dio like
        const usuarioYaDioLike = comentario.liked_by.includes(usuarioId);

        console.log("Estado ", usuarioYaDioLike);

        if (!usuarioYaDioLike&&!isLiked) {
            // Si es un nuevo like
            comentario.num_likes += 1;
            comentario.liked_by.push(usuarioId);
            console.log("Nuevo like agregado. Total likes:", comentario.num_likes,"datos:",usuarioYaDioLike);
            
        } 
        else if (usuarioYaDioLike&&isLiked) {
            // Si se elimina el like
            comentario.num_likes -= 1;
            comentario.liked_by = comentario.liked_by.filter(id => id.toString() !== usuarioId.toString());
            console.log("Like eliminado. Total likes:", comentario.num_likes,"datos:",usuarioYaDioLike);
        } 
        else {
            // Manejo de inconsistencias
            console.warn("Estado inconsistente detectado. isLiked:", isLiked, "usuarioYaDioLike:", usuarioYaDioLike);
        }

        // Guardar los cambios
        await comentario.save({ validateModifiedOnly: true });
        console.warn("RESPUESTA:. likes:", comentario.num_likes, "usuarioYaDioLike:", !usuarioYaDioLike, "isLiked:", isLiked);
        
        // Responder con el estado actualizado
        return res.status(200).json({
            num_likes: comentario.num_likes,
            isLiked: !usuarioYaDioLike,
            liked_by: []
        });

    } catch (err) {
        console.error("Error al manejar el like:", err);
        res.status(500).json({ error: "Error al procesar el like" });
    }
});

// Ruta para eliminar un comentario
router.delete('/eliminarComentario/:comentarioId', async (req, res) => {
    const { comentarioId } = req.params;
    console.log("Eliminando comentario con ID:", comentarioId);

    try {
       
        // Buscar y eliminar el comentario por ID
        const comentario = await Comentario.findOneAndDelete({ comentario_id: comentarioId.trim() });

        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        console.log("Comentario eliminado exitosamente.");

        // Responder con éxito
        return res.status(200).json({ message: "Comentario eliminado exitosamente" });

    } catch (err) {
        console.error("Error al eliminar el comentario:", err);
        return res.status(500).json({ error: "Error al eliminar el comentario" });
    }
});


router.put('/editarComentario/:comentarioId', async (req, res) => {
    const { comentarioId } = req.params; // Obtener el ID del comentario desde la URL
    const { userId, nuevoComentario } = req.body; // Obtener el ID del usuario y el nuevo texto del comentario desde el cuerpo de la solicitud

    try {
        console.log("Editando comentario con ID:", comentarioId, "por el usuario:", userId, "comentario nuevo:", nuevoComentario);

        // Buscar el comentario por ID y verificar si el usuario tiene permisos
        const comentario = await Comentario.findOne({ comentario_id: comentarioId });
        console.log("Comentario encontrado:");
    
        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
            console.log("Comentario no encontrado:");
        }

        // Actualizar el texto del comentario
        comentario.comentario = nuevoComentario;
        await comentario.save();
        console.log("Comentario editado exitosamente.");
        return res.status(200).json({ message: "Comentario editado exitosamente" });

    } catch (err) {
        console.error("Error al editar el comentario:", err);
        return res.status(500).json({ error: "Error al editar el comentario" });
    }
});


// Ruta para responder a un comentario
router.post('/responder', async (req, res) => {
    
    try {
        const { usuario_id, respuesta, comentario_id } = req.body; // Obtener datos desde el cuerpo de la solicitud
        const comentario = await Comentario.findOne({ comentario_id: comentario_id }); // Buscar al usuario por su ID
        
    // Buscar en las tres colecciones de usuarios
    const [atleta, entrenador, administrador] = await Promise.all([
        Atleta.findById(usuario_id),
        Entrenador.findById(usuario_id),
        Administrador.findById(usuario_id)
    ]);

    // Determinar el tipo de usuario y su nombre
    let nombre = '';
    let tipoUsuario = '';

    if (atleta) {
        nombre = atleta.nombre;
        tipoUsuario = 'Atleta';
    } 
    else if (entrenador) {
        nombre = entrenador.nombre;
        tipoUsuario = 'Entrenador';
    } 
    else if (administrador) {
        nombre = administrador.nombre;
        tipoUsuario = 'Administrador';
    } 
    else {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const nuevaRespuesta = {
        usuario_id: usuario_id,
        nombre: nombre,
        respuesta: respuesta, // Asegúrate de que este campo esté correctamente asignado
        comentario_id: comentario_id
    };
    
    console.log("Datos recibidos:", nuevaRespuesta);
    
    // Actualizar el comentario añadiendo la nueva respuesta
    const comentarioActualizado = await Comentario.findOneAndUpdate(
        { comentario_id }, // Busca el comentario por comentario_id
        { $push: { respuestas: nuevaRespuesta } }, // Agregar la respuesta al array de respuestas
        { new: true } // Devuelve el comentario actualizado
    );
    
    console.log("Comentario actualizado:", comentarioActualizado);
    
    // Verificar si el comentario existe
    if (!comentarioActualizado) {
        console.log("Error: Comentario no encontrado con ID:", comentario_id);
        return res.status(404).json({ message: "Comentario no encontrado" });
    }
    
    // Recupera la última respuesta insertada (la última en el array)
    const ultimaRespuesta = comentarioActualizado.respuestas[comentarioActualizado.respuestas.length - 1];

    // Devolver la respuesta completa con su ID
    res.status(201).json({
        respuesta_id: ultimaRespuesta._id, // El ID generado automáticamente
        ...nuevaRespuesta // Los datos de la nueva respuesta
    });
    
        console.log("respuesta:", comentario.respuestas);
      } catch (error) {
         // Log de error con detalles
         console.error('Error al agregar la respuesta:', error);
         res.status(500).json({ message: 'Error al agregar la respuesta' });
     }
    });


  
// Eliminar una respuesta de un comentario
router.delete('/eliminarRespuesta/:comentarioId/:respuestaId', async (req, res) => {
    const { comentarioId, respuestaId } = req.params; // Obtener IDs del comentario y la respuesta
    console.log(`Eliminando respuesta con ID: ${respuestaId} del comentario con ID: ${comentarioId}`);

    try {
        // Buscar el comentario por ID
        const comentario = await Comentario.findOne({ comentario_id: comentarioId.trim() });

        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        // Filtrar las respuestas para eliminar la respuesta deseada
        const respuestaIndex = comentario.respuestas.findIndex(
            (respuesta) => respuesta._id.toString() === respuestaId
        );

        if (respuestaIndex === -1) {
            return res.status(404).json({ error: "Respuesta no encontrada" });
        }

        // Eliminar la respuesta
        comentario.respuestas.splice(respuestaIndex, 1);
        await comentario.save(); // Guardar los cambios en la base de datos

        console.log("Respuesta eliminada exitosamente.");
        return res.status(200).json({ message: "Respuesta eliminada exitosamente" });

    } catch (err) {
        console.error("Error al eliminar la respuesta:", err);
        return res.status(500).json({ error: "Error interno al eliminar la respuesta" });
    }
});




module.exports = router; // Exportar router para utilizarlo en server.js
