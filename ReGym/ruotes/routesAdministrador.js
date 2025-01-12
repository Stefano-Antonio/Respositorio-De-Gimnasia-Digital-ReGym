const express = require('express');
const router = express.Router();
const { Atleta, Entrenador, Administrador } = require('../models/modelosUsuarios')
const { Comentario} = require('../models/modelosComentarios');
const { MatriculasCompartidas} = require('../models/modelosUsuarios')
const mongoose = require('mongoose'); 

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

    console.log("Eliminando usuario:", matricula, usuarioId);

    // Verificar si la matrícula es A001 y no permitir su eliminación
    if (matricula === 'A001') {
        console.log('Intento de eliminar la matrícula A001');  // Este log debe mostrarse si intentas eliminar A001
        return res.status(400).json({ mensaje: 'No se puede eliminar la matrícula A001.' });
    }
    
    try {
        // Validar el formato del usuarioId
        if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
            return res.status(400).json({ message: 'ID de usuario no válido' });
        }

        const atletaEncontrado = await Atleta.findOne({ matricula });

        const entrenadorEncontrado = await Entrenador.findOne({ matricula });

        const administradorEncontrado = await Administrador.findOne({ matricula });

        if (!atletaEncontrado && !entrenadorEncontrado && !administradorEncontrado) {
            console.log('Usuario no encontrado');
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Luego eliminas según corresponda
        if (atletaEncontrado) await Atleta.findOneAndDelete({ matricula });
        if (entrenadorEncontrado) await Entrenador.findOneAndDelete({ matricula });
        if (administradorEncontrado) await Administrador.findOneAndDelete({ matricula });

        // Eliminar comentarios asociados al usuario
        await Comentario.deleteMany({ usuario_id: new mongoose.Types.ObjectId(usuarioId) });
        console.log('Comentarios eliminados');

        // Eliminar respuestas asociadas al usuario
        await Comentario.updateMany(
            { 'respuestas.usuario_id': new mongoose.Types.ObjectId(usuarioId) },
            { $pull: { respuestas: { usuario_id: new mongoose.Types.ObjectId(usuarioId) } } }
        );
        console.log('Respuestas eliminadas');

        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
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
// Ruta para agregar matrículas
router.post('/matriculas/:matricula', async (req, res) => {
    const { matricula } = req.params; // Extraer matrícula desde la URL
    console.log(`[LOG] Intentando agregar la matrícula: ${matricula}`);

    if (!matricula) {
        console.error("[ERROR] No se recibió la matrícula.");
        return res.status(400).json({ mensaje: 'Falta la matrícula en la URL' });
    }

    try {
        // Verificar si la matrícula ya está en uso por cualquier usuario
        const [existeMatriculaEntrenador, existeMatriculaAtleta, existeMatriculaAdministrador] = await Promise.all([
            Entrenador.findOne({ matricula }),
            Atleta.findOne({ matricula }),
            Administrador.findOne({ matricula })
        ]);

        if (existeMatriculaEntrenador || existeMatriculaAtleta || existeMatriculaAdministrador) {
            console.log("[LOG] La matrícula ya está en uso.");
            return res.status(400).json({ mensaje: 'La matrícula ya está en uso por un usuario' });
        }

        // Continuar con la lógica de agregar la matrícula a la colección de matrículas compartidas
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
            return res.status(200).json({ matriculas: registro.matriculas });
        } else {
            console.log("[LOG] La matrícula ya existe en la lista de matrículas compartidas.");
            return res.status(400).json({ mensaje: 'La matrícula ya existe en la lista de matrículas compartidas' });
        }
    } catch (error) {
        console.error("[ERROR] Ocurrió un error al agregar la matrícula:", error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Ruta para eliminar la matrícula// Ruta para eliminar la matrícula
router.delete('/eliminarMatricula/:matricula', async (req, res) => {
    const matricula = req.params.matricula;
    console.log("La matrícula recibida:", matricula);  // Verifica el valor recibido
    
    // Verificar si la matrícula es A001 y no permitir su eliminación
    if (matricula === 'A001') {
        console.log('Intento de eliminar la matrícula A001');  // Este log debe mostrarse si intentas eliminar A001
        return res.status(400).json({ mensaje: 'No se puede eliminar la matrícula A001.' });
    }
  
    try {
      // Eliminar la matrícula de la base de datos de usuarios
      const usuario = await Usuario.findOneAndUpdate(
        { matricula: matricula },
        { $set: { matricula: null } },
        { new: true }
      );
      
      // Resto de la lógica
    } catch (error) {
      console.error('Error al eliminar la matrícula:', error);
      return res.status(500).json({ mensaje: 'Error interno en el servidor.' });
    }
  });
  


module.exports = router;
