const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const RoutesUsuarios = require('./ruotes/routesUsuarios');
const RoutesComentarios = require('./ruotes/routesComentarios');
const RoutesAparatos = require('./ruotes/routesAparatos');

const app = express();

// Configuración de MongoDB
        mongoose.connect('mongodb+srv://Stefano117:Mixbox360@regym.qgw2j.mongodb.net/?retryWrites=true&w=majority&appName=ReGym', {})
            .then(() => console.log('Conectado a MongoDB'))
            .catch(err => console.error('Error conectando a MongoDB', err));

//Middlewares
        app.use(bodyParser.json());
        app.use(cors());

// Usar rutas
        // Usar rutas 
        app.use('/api/usuarios', RoutesUsuarios); 
        // Rutas de usuarios en '/api/usuarios' 
        app.use('/api/comentarios', RoutesComentarios); 
        // Rutas de comentarios en '/api/comentarios' 
        //app.use('/api/aparatos', RoutesAparatos); 
        // Rutas de aparatos en '/api/aparatos'

// Inicializar el servidor
        const port = 4000;
        app.listen(port, () => {
            console.log(`Servidor escuchando en el puerto ${port}`);
        });
