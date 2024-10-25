const mongoose = require('mongoose');
//-----------------{colecciones('Tipo de usuario')}--------------------------

//-----------------Atleta------------------
const atletaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    correo_electronico: { type: String, required: true },
    contrasena: { type: String, required: true },
    matricula: {type: String, required: true}
  });
  
  module.exports = mongoose.model('Atleta', atletaSchema);
  //-----------------Entrenador------------
  const entrenadorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    correo_electronico: { type: String, required: true },
    contrasena: { type: String, required: true },
    matricula: {type: String, required: true},
    rutinas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rutina' }]
    
  });
  
  module.exports = mongoose.model('Entrenador', entrenadorSchema);
  //-----------------Administrador---------
  const administradorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    correo_electronico: { type: String, required: true },
    contrasena: { type: String, required: true },
    matricula: {type: String, required: true}
    
  });
  
  module.exports = mongoose.model('Administrador', administradorSchema);
  
//-----------------[colecciones('Gimnasia')]--------------------------------------

//-----------------[coleccion('Aparatos')]--------------------------------------

const aparatoSchema = new mongoose.Schema({
    aparato_id: { type: String, required: true },
    name: { type: String, required: true },
    tipo_aparato: { type: String, enum: ['piso', 'salto', 'viga', 'barra'], required: true }
  });
  
  module.exports = mongoose.model('Aparato', aparatoSchema);
  

//----{sub-colecciones('Rutina-Movimientos-Comentarios-Respuestas')}--------

//-----------------Rutina-------------------------------
const rutinaSchema = new mongoose.Schema({
    rutina_id: { type: String, required: true },
    movimientos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movimiento' }]
  });
  
  module.exports = mongoose.model('Rutina', rutinaSchema);

//-----------------Movimientos--------------------------
  const movimientoSchema = new mongoose.Schema({
    movimiento_id: { type: String, required: true },
    name: { type: String, required: true },
    comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comentario' }]
  });
  
  module.exports = mongoose.model('Movimiento', movimientoSchema);

//-----------------Comentario--------------------------
  const comentarioSchema = new mongoose.Schema({
    comentario_id: { type: String, required: true },
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    comentario: { type: String, required: true },
    num_likes: { type: Number, default: 0 },
    respuestas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Respuesta' }]
  });
  
  module.exports = mongoose.model('Comentario', comentarioSchema);

//-----------------Respuestas--------------------------
  const respuestaSchema = new mongoose.Schema({
    respuesta_id: { type: String, required: true },
    comentario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', required: true },
    respuesta: { type: String, required: true },
    num_likes: { type: Number, default: 0 }
  });
  
  module.exports = mongoose.model('Respuesta', respuestaSchema);
  
  
  // Exportar todos los modelos en un solo objeto
  /*
module.exports = {
    Atleta: mongoose.model('Atleta', atletaSchema),
    Entrenador: mongoose.model('Entrenador', entrenadorSchema),
    Administrador: mongoose.model('Administrador', administradorSchema),
    Aparato: mongoose.model('Aparato', aparatoSchema),
    Rutina: mongoose.model('Rutina', rutinaSchema),
    Movimiento: mongoose.model('Movimiento', movimientoSchema),
    Comentario: mongoose.model('Comentario', comentarioSchema),
    Respuesta: mongoose.model('Respuesta', respuestaSchema)
  };*/
  