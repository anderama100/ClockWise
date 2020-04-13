// Modulo de Express
const express = require('express');
// Moduloe Path
const path = require('path');
// Importar configuracion y conexion a Mongo.
const { mongoose } = require('./database');

// inicializacion de rutina.
const app = express();

// Configuracion Globlal del app, arranca en el puerto que le diga el contenedor o en el 400
app.set('port', process.env.PORT || 4000);

// Routes -- API REST Express para consultas a Mongo.
app.use(express.json());
app.use('/api/rest/users/', require('./routes/users.routes'));

// Static Files -- Archivos HTML, CSS y demas recursos estaticos
app.use('/portal', express.static(path.join(__dirname, 'public')));

// Iniciar Servidor.
app.listen(app.get('port'), () => {
    console.log(`Ejecutando rutina en puerto ${app.get('port')}`)
}
);