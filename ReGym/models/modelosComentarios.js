const mongoose = require('mongoose');

//Comentarios
const comentario = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    comentario: { type: String, required: true },
    movimiento: {type: String, required: true},
    num_likes: { type: Number, default: 0 },
    respuestas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Respuesta' }]
  });

//Respuestas
const respuesta = new mongoose.Schema({
   usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    comentario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', required: true },
    respuesta: { type: String, required: true }
  });

//Modelos en moongose
const Comentario = mongoose.model('Comentario', comentario);
const Respuesta = mongoose.model('Respuesta', respuesta);

// Exportar modelo para que se pueda usar en otros archivos
module.exports = { Comentario, Respuesta };
