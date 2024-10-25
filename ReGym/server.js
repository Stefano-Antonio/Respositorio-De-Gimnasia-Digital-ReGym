const bodyParser = require('body-parser');
const path = require('path');
const port = 4000;

const express = require('express');
const app = express();

const mongoose = require('mongoose');

const cors = require('cors');

const admin = require('firebase-admin');
const serviceAccount = require(path.join(__dirname, 'credenciales.json'));

app.use(bodyParser.json());
app.use(cors());
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Configuración de MongoDB
mongoose.connect('mongodb+srv://Stefano117:Mixbox360@regym.qgw2j.mongodb.net/?retryWrites=true&w=majority&appName=ReGym', {})
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB', err));

// Modelos de usuario
const atletaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

const entrenadorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});
const administradorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matricula: { type: String, required: true, unique: true }, // atletas U0001, entrenadores E0001, administrador A0001,
});

// Modelos en Mongoose
const Atleta = mongoose.model('Atleta', atletaSchema);
const Entrenador = mongoose.model('Entrenador', entrenadorSchema);
const Administrador = mongoose.model('Administrador', administradorSchema);

                             
// Ruta para registrar usuarios
app.post('/api/usuarios', async (req, res) => {
    const { nombre, correo, password, matricula } = req.body;

    // Determina el modelo de usuario en función de la matrícula
    if (matricula.startsWith('U')) {
        User = Atleta;
    } else if (matricula.startsWith('E')) {
        User = Entrenador;
    } else if (matricula.startsWith('A')) {
        User = Administrador;
    } else {
        return res.status(400).json({ mensaje: "Tipo de usuario desconocido" });
    }

    // Crear y guardar el usuario en la colección correspondiente
    const nuevoUsuario = new User({ nombre, correo, password, matricula });

    try {
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error(error);
        res.status(400).json({ mensaje: 'Error al crear usuario', error });
    }
});

//Ruta para verificar correo y contraseña para inicio de sesion
app.post('/api/iniciarSesion', async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Intentar encontrar al usuario en la colección de Atletas
        let usuario = await Atleta.findOne({ correo: correo, password: password });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "atleta", usuario });
        }

        // Intentar encontrar al usuario en la colección de Entrenadores
        usuario = await Entrenador.findOne({ correo: correo, password: password });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "entrenador", usuario });
        }

        // Intentar encontrar al usuario en la colección de Administradores
        usuario = await Administrador.findOne({ correo: correo, password: password });
        if (usuario) {
            return res.status(200).json({ mensaje: "Inicio de sesión exitoso", tipoUsuario: "administrador", usuario });
        }

        // Si el usuario no fue encontrado en ninguna colección
        res.status(401).json({ mensaje: "Credenciales incorrectas" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

//Ruta para recuperar contraseña:
app.post('/api/recuperarContrasena', async (req, res) => {
    const { correo } = req.body;
    console.log("Correo recibido:", correo); // Log para verificar el correo recibido
//return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: usuario.tipoUsuario, usuario: usuario.datos });
        
    try {
        // Intentar encontrar al usuario en la colección de Atletas
        let usuario = await Atleta.findOne({ correo: correo });
        if (usuario) {
            console.log("Usuario encontrado en Atletas:", usuario); // Log para verificar al usuario encontrado
            return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: "atleta", usuario: usuario.datos });
        }

        // Intentar encontrar al usuario en la colección de Entrenadores
        usuario = await Entrenador.findOne({ correo: correo});
        if (usuario) {
            console.log("Usuario encontrado en Entrenadores:", usuario);
            return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: "entrenador", usuario: usuario.datos });
        }

        // Intentar encontrar al usuario en la colección de Administradores
        usuario = await Administrador.findOne({ correo: correo});
        if (usuario) {
            console.log("Usuario encontrado en Administradores:", usuario);
            return res.status(200).json({ mensaje: "Se encontro al usuario", tipoUsuario: "administrador", usuario: usuario.datos });
        }

        // Si el usuario no fue encontrado en ninguna colección
        console.log("Usuario no encontrado en ninguna colección.");
        res.status(401).json({ mensaje: "Credenciales incorrectas" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});







// Inicializar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
