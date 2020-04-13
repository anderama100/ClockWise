
const express = require('express'),bodyParser = require('body-parser'), jwt = require('jsonwebtoken'), config = require('../../configs/config');
const router = express.Router();


const UsersMongo = require('../models/users');

// JWT -- Protect the API through JWT and Token validation.
router.use((req, res, next) => {
    const token = req.headers['access-token'];
    const llave=config.llave;
    if (token) {
      jwt.verify(token, llave, (err, decoded) => {      
        if (err) {
          return res.json({ estado: "ERROR", mensaje: 'Wrong Token, Does not authenticate.'  });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.send({ 
         estado: "ERROR", mensaje: 'Token missing' 
      });
    }
 });

//Task defined through REST into user's structure
// Check all users on DB.
router.get('/', async (req, res) => {
    const users = await UsersMongo.find();
    res.json(users);
});

// Saving new user and validations
router.post('/', async (req, res) => {
    try {
        const { login, encPassword, firstName, lastName } = req.body;
        // New user initialized
        const newUser = new UsersMongo({ login, encPassword, firstName, lastName });

        if (newUser.login.toString() == "" || newUser.encPassword.toString() == "" || newUser.firstName.toString() === "") {
            res.json({ estado: "ERROR", mensaje: 'JSON Structure in not Completed' });
        }
        else {
            // Validate user does not exist.
            const userQuery = await UsersMongo.findOne({ login: newUser.login });
            if (userQuery === null) {
                await newUser.save();
                res.json({ estado: "OK", mensaje: "User Created " });
            }
            else {
                res.json({ estado: "ERROR", mensaje: "User " + newUser.login + " already exists on database" });
            }
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }

});

// Updating users using PUT.
router.put('/:id', async (req, res) => {
    try {
        const { login, encPassword, firstName, lastName,lastLogin,locked } = req.body;
        // User Parameters to Update
        const updateUser = { login, encPassword, firstName, lastName,lastLogin,locked };

        if (updateUser.login.toString() == "" || updateUser.encPassword.toString() == "" || updateUser.firstName.toString() === "") {
            res.json({ estado: "ERROR", mensaje: "JSON Estructure is not complete to update" });
        }
        else {
            await UsersMongo.findByIdAndUpdate(req.params.id,updateUser);
            res.json({ estado: "OK", mensaje: "User Updated" });
        }
    } catch (error) {
        res.json({ estado: "ERROR", mensaje: error.toString() });
    }

});

// User delete by ID
router.delete('/:id',async(req,res)=>{
    await UsersMongo.findByIdAndRemove(req.params.id);
    res.json({ estado: "OK", mensaje: "User Deleted" });
});

// Search users by login and pwd
router.get('/:login/:pass', async (req, res) => {
    const queryRequest={"login":req.params.login,"encPassword":req.params.pass};
    const userQuery = await UsersMongo.findOne(queryRequest);

    if(userQuery!=null){
        res.json({ estado: "OK", mensaje: "Authentication Success "+userQuery._id });
    }
    else{
        res.json({ estado: "ERROR", mensaje: "User " + req.params.login + " is not authenticated" });
    }
});

module.exports = router;