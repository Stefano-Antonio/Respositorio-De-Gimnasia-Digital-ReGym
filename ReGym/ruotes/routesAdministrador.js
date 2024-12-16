const express = require('express');
const router = express.Router();
const { Atleta, Entrenador, Administrador } = require('../Models/modelosUsuarios')
const { Comentario} = require('../Models/modelosComentarios');
const { MatriculasCompartidas} = require('../Models/modelosUsuarios')

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const administradores = await Administrador.find();
    const entrenadores = await Entrenador.find();
    const atletas = await Atleta.find();

    const todosLosUsuarios = [
        ...administradores.map(user => ({ 
          id: user._id, 
          nombre: user.nombre,
          correo: user.correo,
          matricula: user.matricula,
          contraseña: user.contraseña  
        })),
        ...entrenadores.map(user => ({ 
          id: user._id, 
          nombre: user.nombre,
          correo: user.correo,
          matricula: user.matricula,
          contraseña: user.contraseña 
        })),
        ...atletas.map(user => ({ 
          id: user._id, 
          nombre: user.nombre,
          correo: user.correo,
          matricula: user.matricula,
          contraseña: user.contraseña 
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

// Ruta para editar usuarios
router.put('/usuarios/editar/:matriculaAux/:nuevaMatricula/:nuevoNombre', async (req, res) => {
    const { matriculaAux, nuevaMatricula, nuevoNombre } = req.params;

    console.log("Datos recibidos:", matriculaAux, nuevaMatricula, nuevoNombre);

    try {
        // Verificar si la nueva matrícula ya está en uso, excepto si es la misma que la anterior
        const [existeMatriculaEntrenador, existeMatriculaAtleta, existeMatriculaAdministrador] = await Promise.all([
            Entrenador.findOne({ matricula: nuevaMatricula }),
            Atleta.findOne({ matricula: nuevaMatricula }),
            Administrador.findOne({ matricula: nuevaMatricula })
        ]);

        // Si la nueva matrícula está en uso y no es igual a la matrícula antigua
        if ((existeMatriculaEntrenador || existeMatriculaAtleta || existeMatriculaAdministrador) && matriculaAux !== nuevaMatricula) {
            console.log("La matrícula ya está en uso.");
            return res.status(400).json({ message: "La matrícula ya está en uso" });
        }

        // Función para actualizar la matrícula y nombre en un modelo
        const actualizarUsuario = async (modelo, matriculaAux, nuevaMatricula, nuevoNombre) => {
            if (matriculaAux === nuevaMatricula) {
                // Si las matrículas son iguales, solo actualizamos el nombre
                return await modelo.findOneAndUpdate(
                    { matricula: matriculaAux },
                    { nombre: nuevoNombre },
                    { new: true }
                );
            } else {
                // Si las matrículas son diferentes, actualizamos tanto la matrícula como el nombre
                return await modelo.findOneAndUpdate(
                    { matricula: matriculaAux },
                    { matricula: nuevaMatricula, nombre: nuevoNombre },
                    { new: true }
                );
            }
        };

        // Intentar actualizar en cada modelo
        let usuarioActualizado = await actualizarUsuario(Entrenador, matriculaAux, nuevaMatricula, nuevoNombre);

        if (!usuarioActualizado) {
            usuarioActualizado = await actualizarUsuario(Atleta, matriculaAux, nuevaMatricula, nuevoNombre);
        }

        if (!usuarioActualizado) {
            usuarioActualizado = await actualizarUsuario(Administrador, matriculaAux, nuevaMatricula, nuevoNombre);
        }

        // Si no se encuentra el usuario en ninguno de los modelos
        if (!usuarioActualizado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si se actualiza correctamente, devuelve el usuario actualizado
        res.status(200).json(usuarioActualizado);
        console.log("Usuario actualizado:", usuarioActualizado);

    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
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

// Ruta obtener matriculas
router.get('/matriculas', async (req, res) => {
    console.log(`[LOG] Iniciando solicitud para obtener todas las matrículas`);

    try {
        // Obtener todas las matrículas de la colección
        let registro = await MatriculasCompartidas.findOne();
        
        if (!registro) {
            console.log(`[LOG] No existe ningún registro de matrículas.`);
            return res.status(404).json({ mensaje: 'No hay matrículas registradas', matriculas: [] });
        }

        console.log(`[LOG] Registro de matrículas:`, registro.matriculas);
        res.status(200).json({ mensaje: 'Matrículas obtenidas correctamente', matriculas: registro.matriculas });

    } catch (error) {
        console.error(`[ERROR] Error al obtener las matrículas:`, error);
        res.status(500).json({ mensaje: 'Error al obtener las matrículas', error });
    }
});

// Ruta para agregar matriculas
router.post('/matriculas/:matricula', async (req, res) => {
    const { matricula } = req.params; // Extraer matrícula desde la URL
    console.log(`[LOG] Intentando agregar la matrícula: ${matricula}`);

    if (!matricula) {
        console.error("[ERROR] No se recibió la matrícula.");
        return res.status(400).json({ mensaje: 'Falta la matrícula en la URL' });
    }

    try {
        let registro = await MatriculasCompartidas.findOne();

        if (!registro) {
            registro = await MatriculasCompartidas.create({ matriculas: [matricula] });
            console.log(`[LOG] Nuevo registro creado con matrícula: ${matricula}`);
            return res.status(201).json({ mensaje: 'Matrícula agregada correctamente', matriculas: registro.matriculas });
        }

        if (!registro.matriculas.includes(matricula)) {
            registro = await MatriculasCompartidas.findOneAndUpdate(
                { _id: registro._id }, 
                { $addToSet: { matriculas: matricula } }, 
                { new: true }
            );
            console.log(`[LOG] Matrícula agregada correctamente. Lista actualizada:`, registro.matriculas);
            return res.status(200).json({matriculas: registro.matriculas });
        } else {
            console.log("[LOG] La matrícula ya existe en la lista.");
            return res.status(400).json({ mensaje: 'La matrícula ya existe en la lista' });
        }
    } catch (error) {
        console.error("[ERROR] Ocurrió un error al agregar la matrícula:", error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Ruta para eliminar la matrícula
router.delete('/eliminarMatricula/:matricula', async (req, res) => {
  const matricula = req.params.matricula;

  try {
    // Eliminar la matrícula de la base de datos de usuarios (si la encuentras ahí)
    const usuario = await Usuario.findOneAndUpdate(
      { matricula: matricula },
      { $set: { matricula: null } }, // O puedes eliminar el usuario si así lo deseas
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario con esa matrícula no encontrado.' });
    }

    // Si tienes una colección separada para matriculas disponibles, elimínala de allí también
    const matriculaEliminada = await Matricula.findOneAndDelete({ matricula: matricula });

    if (!matriculaEliminada) {
      return res.status(404).json({ mensaje: 'Matrícula no encontrada en la lista de matrículas disponibles.' });
    }

    return res.status(200).json({ mensaje: 'Matrícula eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar la matrícula:', error);
    return res.status(500).json({ mensaje: 'Error interno en el servidor.' });
  }
});

module.exports = router;
