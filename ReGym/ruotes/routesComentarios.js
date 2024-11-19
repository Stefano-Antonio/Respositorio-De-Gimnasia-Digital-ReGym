const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Comentario, Respuesta } = require('../Models/modelosComentarios');
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios');

router.use(bodyParser.json());

        // Ruta para crear un comentario
        router.post('/', async (req, res) => {
            const { usuario_id, comentario, movimiento } = req.body;
        // Agregar log para verificar los valores recibidos console.
        console.log('Recibido movimiento_id:', movimiento);
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
                    usuario_id: usuarioObjectId,
                    movimiento,  // movimiento_id como string
                    comentario,
                    num_likes: 0,
                    respuestas: []
                });
        
                // Guardar el comentario en la base de datos
                const comentarioGuardado = await nuevoComentario.save();
                return res.status(201).json({mensaje: "Comentario guardado exitosamente",comentario: comentarioGuardado});
                
                // Determinar el tipo de usuario
                let tipoUsuario = 'Desconocido';
                if (usuario.matricula.startsWith('U')) {
                    tipoUsuario = 'Atleta';
                } else if (usuario.matricula.startsWith('E')) {
                    tipoUsuario = 'Entrenador';
                } else if (usuario.matricula.startsWith('A')) {
                    tipoUsuario = 'Administrador';
                }
        
                
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Error al guardar el comentario", message: error.message });
            }
        });
        
// Ruta para obtener comentarios por movimiento_id
router.get('/:movimiento', async (req, res) => {
    const { movimiento } = req.params;

    try {
        // Encontrar todos los comentarios que coincidan con el movimiento_id
        const comentarios = await Comentario.find({ movimiento });

        // Verificar si se encontraron comentarios
        if (!comentarios.length) {
            return res.status(404).json({ error: 'No se encontraron comentarios para este movimiento' });
        }

        // Devolver los comentarios encontrados
        console.log('Comentarios encontrados:', comentarios); // Verificar qué se devuelve
        return res.status(200).json(comentarios);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al obtener los comentarios", message: error.message });
    }
});

router.get('/cargarcomentarios', async (req, res) => {
// Encapsula el código en una función `async` para evitar el error con `await`
async function cargarComentarios() {
    try {
      const comentarios = await Comentario.find()
        .populate({ path: 'usuario_id', select: 'nombre' })
        .populate({ path: 'respuestas', select: 'respuesta num_likes' });
      
      // Aquí puedes manejar los comentarios, por ejemplo, enviarlos en una respuesta si estás en una ruta
      console.log(comentarios);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    }
  }

  const comentarioActualizado = await Comentario.findByIdAndUpdate(
    comentario_id,
    { $push: { respuestas: respuestaGuardada._id } },
    { new: true, useFindAndModify: false }
).populate('respuestas');
  
  // Llama a la función para ejecutar el código
  cargarComentarios();
  
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
