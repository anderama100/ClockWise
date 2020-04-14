
const express = require('express'), bodyParser = require('body-parser'), jwt = require('jsonwebtoken'), config = require('../../configs/config');
const router = express.Router();

// JWT -- Tokens by petition - Creating Tokens
router.post('/token', async (req, res) => {
    try {
        const llave=config.llave;
        const { appModule } = req.body;
        const payload = {
            appModule: appModule
        };

        if (appModule === 'jsCJP') {
            const token = jwt.sign(payload, llave, { expiresIn: 10 });
            return res.json({ estado: "OK", mensaje: 'Token Generated', token: token });
        }
        else {
            return res.json({ estado: "ERROR", mensaje: 'Token not Generated', token: '' });
        }
    } catch (error) {
        return res.json({ estado: "ERROR", mensaje: 'Error Creating Token '+error, token: '' });
    }

});

module.exports = router;