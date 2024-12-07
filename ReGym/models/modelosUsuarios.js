const mongoose = require('mongoose');

// Usuarios
const atleta = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

const entrenador = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

const administrador = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

// Modelos en Mongoose
const Atleta = mongoose.model('Atleta', atleta);
const Entrenador = mongoose.model('Entrenador', entrenador);
const Administrador = mongoose.model('Administrador', administrador);

// Exportar modelo para que se pueda usar en otros archivos
module.exports = { Atleta, Entrenador, Administrador};
