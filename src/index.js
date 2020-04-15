// Express Module , JWT, key encription and BodyParser
const express = require('express'), bodyParser = require('body-parser'), jwt = require('jsonwebtoken'), config = require('../configs/config');
// Path Module
const path = require('path');
// Mongo config & Connection.
require('dotenv').config();
const { mongoose } = require('./database');

// initializing.
const app = express(); 

// JWT Configuration
app.set('llave', config.llave);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/autenticar', (req, res) => {
    const payload = {
        check: true
    };
    const token = jwt.sign(payload, app.get('llave'), {expiresIn: 1440});//2 mins
    res.json({mensaje: 'Token Is:',token: token
    });
})

// Globlal App Config, 
app.set('port', process.env.PORT || 4000);

// Routes -- API REST Express & Mongo .
app.use(express.json());
app.use('/portal/api/rest/users/', require('./routes/users.routes'));
app.use('/portal/api/rest/secure/', require('./routes/secure.routes'));
app.use('/portal/api/rest/appointment/', require('./routes/appointment.routes'));

// Static Files -- HTML files, CSS 
app.use('/portal', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.redirect('/portal'); 
});

// Server Init.
app.listen(app.get('port'), () => {
    console.log(`Connecting on Port ${app.get('port')}`)
}
);