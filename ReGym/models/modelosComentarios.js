const mongoose = require('mongoose');

//Comentarios
const comentario = new mongoose.Schema({
  comentario_id: { type: String, required: true ,unique: true},
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre: { type: String, required: true },
  comentario: { type: String, required: true },
  movimiento: { type: String, required: true },
  num_likes: { type: Number, default: 0 },
  liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], // Lista de usuarios que dieron like
  respuestas: [{ 
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, strict: true },
    nombre: { type: String, required: true },
    respuesta: { type: String, required: true }
  }]
});




//Modelos en moongose
const Comentario = mongoose.model('Comentario', comentario);

// Exportar modelo para que se pueda usar en otros archivos
module.exports = { Comentario };
