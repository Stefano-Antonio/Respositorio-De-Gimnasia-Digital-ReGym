const mongoose = require('mongoose');

//Aparatos
const aparato = new mongoose.Schema({
    aparato_id: { type: String, required: true },
    name: { type: String, required: true },
    tipo_aparato: { type: String, enum: ['piso', 'salto', 'viga', 'barra'], required: true }
  });
//Rutinas
const rutina = new mongoose.Schema({
    rutina_id: { type: String, required: true },
    movimientos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movimiento' }]
  });
//Movimientos
const movimiento = new mongoose.Schema({
    movimiento_id: { type: String, required: true },
    name: { type: String, required: true },
    comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comentario' }]
  });
// Modelos en Mongoose
const Aparato = mongoose.model('Aparato', aparato);
const Rutina = mongoose.model('Rutina', rutina);
const Movimiento = mongoose.model('Movimiento', movimiento);

// Exportar modelo para que se pueda usar en otros archivos
module.exports = { Aparato, Rutina, Movimiento};
