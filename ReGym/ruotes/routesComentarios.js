const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Comentario, Respuesta } = require('../Models/modelosComentarios');
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios');
const { ObjectId } = mongoose.Types; // Asegúrate de tener acceso a ObjectId

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
                    movimiento,  // movimiento_id como string
                    num_likes: 0,
                    respuestas: []
                });
        
                // Guardar el comentario en la base de datos
                const comentarioGuardado = await nuevoComentario.save();
                // Devuelves el comentario guardado con su _id (comentario_id)
                return res.status(201).json({
                    mensaje: "Comentario guardado exitosamente",
                    comentarioId: nuevoComentario._id.toString(), // Asegúrate de que este campo esté siendo enviado
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
            
        } else if (usuarioYaDioLike&&isLiked) {
            // Si se elimina el like
            comentario.num_likes -= 1;
            comentario.liked_by = comentario.liked_by.filter(id => id.toString() !== usuarioId.toString());
            console.log("Like eliminado. Total likes:", comentario.num_likes,"datos:",usuarioYaDioLike);
        } else {
            // Manejo de inconsistencias
            console.warn("Estado inconsistente detectado. isLiked:", isLiked, "usuarioYaDioLike:", usuarioYaDioLike);
        }

        // Guardar los cambios
        await comentario.save();
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





// Ruta para crear una respuesta
router.post('/respuestas', async (req, res) => {
            try {
                const { comentario_id, respuesta } = req.body;

                // Crear una nueva respuesta
                const nuevaRespuesta = new Respuesta({
                    usuario,
                    comentario_id,
                    respuesta
                });

                // Guardar la respuesta en MongoDB
                const respuestaGuardada = await nuevaRespuesta.save();

                // Actualizar el comentario con la referencia a la nueva respuesta
                await Comentario.findByIdAndUpdate(
                    comentario_id,
                    { $push: { respuestas: respuestaGuardada._id } },
                    { new: true, useFindAndModify: false }
                );

                res.status(201).json(respuestaGuardada);
            } catch (error) {
                console.error(error); // Para ver detalles en la consola
                res.status(500).json({ error: 'Error al guardar la respuesta', message: error.message });
            }
        });



module.exports = router; // Exportar router para utilizarlo en server.js
