// Express Module
const express = require('express'), bodyParser = require('body-parser'), jwt = require('jsonwebtoken'), config = require('../../configs/config');
const router = express.Router();

// 
const AppointmentMongo = require('../models/appointment');

// JWT -- Protects all API through JWT and Token Validation.
router.use((req, res, next) => {
    const token = req.headers['access-token'];
    const llave = config.llave;
    if (token) {
        jwt.verify(token, llave, (err, decoded) => {
            if (err) {
                return res.json({ estado: "ERROR", mensaje: 'Wrong Token, can not authenticate.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            estado: "ERROR", mensaje: 'Token has not been received'
        });
    }
});


// Creating new task through REST for the Agenda structure.
// Retrieve task from DB.
router.get('/', async (req, res) => {
    const users = await AppointmentMongo.find();
    res.json(users);
});

// Saving new Task.
router.post('/', async (req, res) => {
    try {
        const { login, dateFormated, date, title, description, active, color } = req.body;
        // init new task 
        const newTask = new AppointmentMongo({ login, dateFormated, date, title, description, active, color });

        if (newTask.login.toString() == "" || newTask.dateFormated.toString() == "" || newTask.title.toString() === "") {
            res.json({ estado: "ERROR", mensaje: 'JSON Structure is not comemplete for new task' });
        }
        else {
            // Checking user does not exist by login title & date
            const taskQuery = await AppointmentMongo.findOne({ login: newTask.login, dateFormated: newTask.dateFormated, title: newTask.title });
            if (taskQuery === null) {
                await newTask.save();
                res.json({ estado: "OK", mensaje: "Task Schedule Succesfully." });
            }
            else {
                res.json({ estado: "ERROR", mensaje: "Task Already Exists [" + newTask.title + "] On the App for  [" + newTask.dateFormated + "]" });
            }
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }
});

// Update Task by ID
router.put('/:id', async (req, res) => {
    try {
        const { login, dateFormated, date, title, description, active, color } = req.body;
        // User task parameters to Update
        const updtateTask = { login, dateFormated, date, title, description, active, color };

        if (updtateTask.login.toString() == "" || updtateTask.title.toString() == "") {
            res.json({ estado: "ERROR", mensaje: "JSON Structure is not complete" });
        }
        else {            
            await AppointmentMongo.findByIdAndUpdate(req.params.id,updtateTask);
            res.json({ estado: "OK", mensaje: "Task Update Succesfully" });
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }
});

// Deleting Task
router.delete('/:id', async (req, res) => {
    await AppointmentMongo.findByIdAndRemove(req.params.id);
    res.json({ estado: "OK", mensaje: "Task Deleted Succesfully" });
});

// Retrieve task by ID
router.get('/id/:id', async (req, res) => {
    const queryRequest = { "_id": req.params.id };
    const userQuery = await AppointmentMongo.findOne(queryRequest);

    if (userQuery != null) {
        res.json(userQuery);
    }
    else {
        res.json({ estado: "ERROR", mensaje: "There is not tasks for ID " + req.params.login });
    }
});

// Retrieve all user tasks
router.get('/:login', async (req, res) => {
    console.log('login:' + req.params.login);
    const queryRequest = { "login": req.params.login };
    const userQuery = await AppointmentMongo.find(queryRequest);

    if (userQuery != null) {
        res.json(userQuery);
    }
    else {
        res.json({ estado: "ERROR", mensaje: "There is not tasks for user " + req.params.login });
    }
});

// Retreive all tasks by user and date
router.get('/:login/:fecha', async (req, res) => {
    const queryRequest = { "login": req.params.login, "dateFormated": req.params.fecha };
    const userQuery = await AppointmentMongo.find(queryRequest);

    if (userQuery != null) {
        res.json(userQuery);
    }
    else {
        res.json({ estado: "ERROR", mensaje: "There is not tasks for user " + req.params.login + " on Date " + req.params.fecha });
    }
});


module.exports = router;