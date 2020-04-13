
const express = require('express'), bodyParser = require('body-parser'), jwt = require('jsonwebtoken'), config = require('../../configs/config');
const router = express.Router();

// Const of Scheme
const AppointmentMongo = require('../models/appointment');

// JWT -- Protect whole API through JWT and token validation.
/*
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
 */

// Empezamos a definicar tareas para exponer mediantes REST para la estructura Tareas de Agenda.
// Consultar todas las citas o tareas en la base de datos.
router.get('/', async (req, res) => {
    const users = await AppointmentMongo.find();
    res.json(users);
});

// Saving new task.
router.post('/', async (req, res) => {
    try {
        const { login, dateFormated, date, title, description, active, color } = req.body;
        // New Task initializated
        const newTask = new AppointmentMongo({ login, dateFormated, date, title, description, active, color });

        if (newTask.login.toString() == "" || newTask.dateFormated.toString() == "" || newTask.title.toString() === "") {
            res.json({ estado: "ERROR", mensaje: 'JSON structure in not completed for a new task' });
        }
        else {
            // Controling duplicated task per user by title an date
            const taskQuery = await AppointmentMongo.findOne({ login: newTask.login, dateFormated: newTask.dateFormated , title:newTask.title });
            if (taskQuery === null) {
                await newTask.save();
                res.json({ estado: "OK", mensaje: "Task Scheduled Successfully." });
            }
            else {
                res.json({ estado: "ERROR", mensaje: "Task already exist ["+newTask.title+"] on agenda for ["+newTask.dateFormated+"]" });
            }
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }
});

// Deleting Tasks
router.delete('/:id',async(req,res)=>{
    await AppointmentMongo.findByIdAndRemove(req.params.id);
    res.json({ estado: "OK", mensaje: "Task Deleted" });
});

// Retrieving user's tasks
router.get('/:login', async (req, res) => {
    console.log('login:'+req.params.login);
    const queryRequest={"login":req.params.login};
    const userQuery = await AppointmentMongo.find(queryRequest);

    if(userQuery!=null){
        res.json(userQuery);
    }
    else{
        res.json({ estado: "ERROR", mensaje: "There is not task for user "+req.params.login});
    }
});

// consulta todas las tareas por usuario y Fecha
router.get('/:login/:fecha', async (req, res) => {    
    const queryRequest={"login":req.params.login,"dateFormated":req.params.fecha};
    const userQuery = await AppointmentMongo.find(queryRequest);

    if(userQuery!=null){
        res.json(userQuery);
    }
    else{
        res.json({ estado: "ERROR", mensaje: "There is not task for user "+req.params.login+" on date "+req.params.fecha});
    }
});


module.exports = router;