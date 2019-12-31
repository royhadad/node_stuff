//#region requirments
const secretVariables = require('dotenv').config().parsed;
const ERROR_CODES = require('../errorCodes.js');
const express = require('express');
const users = require('../users.js');
const ResponseObj = require('../ResponseObj.js');
const { isInputValid, USERNAME_VALIDATION_OBJECT, PASSWORD_VALIDATION_OBJECT, FULLNAME_VALIDATION_OBJECT, ABOUT_VALIDATION_OBJECT } = require('../inputValidation.js');
const jwt = require("jsonwebtoken");
const SECRET_KEY = secretVariables.SECRET_KEY;
const router = express.Router();
//#endregion

router.get('/api/users/getUser/:id', (req, res) =>
{
    let responseObj = new ResponseObj();
    users.getUserById(req.params.id)
        .then((result) =>
        {
            if (result)
            {
                responseObj.data = result;
                res.send(JSON.stringify(responseObj));
            }
            else
            {
                responseObj.error = "user not found!";
                res.status(ERROR_CODES.NOT_FOUND).send(JSON.stringify(responseObj));
            }
        })
        .catch((error) =>
        {
            responseObj.error = error.message;
            res.status(ERROR_CODES.NOT_FOUND).send(JSON.stringify(responseObj));
        });
});

router.get('/favicon.ico', (req, res) =>
{
    res.status(ERROR_CODES.NO_CONTENT);
});

module.exports = router;