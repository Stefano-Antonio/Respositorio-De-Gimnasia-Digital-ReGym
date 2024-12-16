const mongoose = require('mongoose');
// Usuarios
const atleta = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

const entrenador = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

const administrador = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

const matriculascompartidas = new mongoose.Schema({
    matriculas: [{ type: String, required: true, unique: true }],
});


// Modelos en Mongoose
const MatriculasCompartidas = mongoose.model('MatriculasCompartidas', matriculascompartidas);
const Atleta = mongoose.model('Atleta', atleta);
const Entrenador = mongoose.model('Entrenador', entrenador);
const Administrador = mongoose.model('Administrador', administrador);

// Exportar modelos para que se pueda usar en otros archivos
module.exports = { Atleta, Entrenador, Administrador, MatriculasCompartidas };