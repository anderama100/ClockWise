// Modulo Express
const express = require('express'),bodyParser = require('body-parser'), jwt = require('jsonwebtoken'), config = require('../../configs/config');
const router = express.Router();

// Definimos en la constante el Schema que se va a manejar
const UsersMongo = require('../models/users');

// JWT -- Protege toda la API mediante JWT y validacion de Token.
router.use((req, res, next) => {
    const token = req.headers['access-token'];
    const llave=config.llave;
    if (token) {
      jwt.verify(token, llave, (err, decoded) => {      
        if (err) {
          return res.json({ estado: "ERROR", mensaje: 'Token incorrecto, no procede autenticacion.'  });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.send({ 
         estado: "ERROR", mensaje: 'No se ha recibido token de autenticacion' 
      });
    }
 });

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

// Actualizar usuarios mediante PUT.
router.put('/:id', async (req, res) => {
    try {
        const { login, encPassword, firstName, lastName,lastLogin,locked } = req.body;
        // Parametros de usuario a actualizar
        const updateUser = { login, encPassword, firstName, lastName,lastLogin,locked };

        if (updateUser.login.toString() == "" || updateUser.encPassword.toString() == "" || updateUser.firstName.toString() === "") {
            res.json({ estado: "ERROR", mensaje: "La Estructura JSON no esta Completa para la actualizacion" });
        }
        else {
            await UsersMongo.findByIdAndUpdate(req.params.id,updateUser);
            res.json({ estado: "OK", mensaje: "Usuario actualizado Correctamente" });
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }

});

// Borrado de usuario by ID
router.delete('/:id',async(req,res)=>{
    await UsersMongo.findByIdAndRemove(req.params.id);
    res.json({ estado: "OK", mensaje: "Usuario eliminado Correctamente" });
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