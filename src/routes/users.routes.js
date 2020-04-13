// Modulo Express
const express = require('express');
const router = express.Router();

// Definimos en la constante el Schema que se va a manejar
const UsersMongo = require('../models/users');

// Empezamos a definicar tareas para exponer mediantes REST para la estructura usuarios.

// Consultar todos los usuarios en la base de datos.
router.get('/', async (req, res) => {
    const users = await UsersMongo.find();
    res.json(users);
});

// Guardar nuevo Usuario, realizando validaciones.
router.post('/', async (req, res) => {
    try {
        const { login, encPassword, firstName, lastName } = req.body;
        // inicializacion de nuevo usuario
        const newUser = new UsersMongo({ login, encPassword, firstName, lastName });

        if (newUser.login.toString() == "" || newUser.encPassword.toString() == "" || newUser.firstName.toString() === "") {
            res.json({ estado: "ERROR", mensaje: 'La Estructura JSON no esta Completa' });
        }
        else {
            // validar que el usuario no exista por Login.
            const userQuery = await UsersMongo.findOne({ login: newUser.login });
            if (userQuery === null) {
                await newUser.save();
                res.json({ estado: "OK", mensaje: "Usuario Creado Correctamente" });
            }
            else {
                res.json({ estado: "ERROR", mensaje: "Usuario " + newUser.login + " ya existe en base de datos" });
            }
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }

});




// Consultar Usuarios by login y clave
router.get('/:login/:pass', async (req, res) => {
    const queryRequest={"login":req.params.login,"encPassword":req.params.pass};
    const userQuery = await UsersMongo.findOne(queryRequest);

    if(userQuery!=null){
        res.json({ estado: "OK", mensaje: "Autenticacion Exitosa "+userQuery._id });
    }
    else{
        res.json({ estado: "ERROR", mensaje: "Usuario " + req.params.login + " no autenticado en el sistema" });
    }
});

module.exports = router;