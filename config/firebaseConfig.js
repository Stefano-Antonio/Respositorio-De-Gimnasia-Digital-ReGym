const admin = require("firebase-admin");
const path = require("path");

// Ruta hacia tu archivo de credenciales
const serviceAccount = require("C:\\Users\\Stefano\\Documents\\Escuela\\11vo Semestre\\TT2\\ReGym\\ReGym\\credenciales.json");


// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "gs://regym-73d4e.appspot.com" // Reemplaza con tu URL de Firebase si es necesario
});

module.exports = admin;
