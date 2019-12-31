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

router.post('/api/users/createUser', (req, res) =>
{
    let userObj = req.body;
    if (!isInputValid({
        username: USERNAME_VALIDATION_OBJECT.required(),
        password: PASSWORD_VALIDATION_OBJECT.required(),
        fullName: FULLNAME_VALIDATION_OBJECT.required(),
        about: ABOUT_VALIDATION_OBJECT.required()
    }, userObj, res))
        return;

    let responseObj = new ResponseObj();
    users.createUser(userObj)
        .then((result) =>
        {
            if (result)
            {
                responseObj.data = result;
                res.status(ERROR_CODES.CREATED).send(JSON.stringify(responseObj));
            }
            else
            {
                responseObj.error = "couldnt create new user!";
                res.status(ERROR_CODES.BAD_REQUEST).send(JSON.stringify(responseObj));
            }
        })
        .catch((error) =>
        {
            responseObj.error = error.message;
            res.status(ERROR_CODES.BAD_REQUEST).send(JSON.stringify(responseObj));
        });
});

router.post('/api/users/login', (req, res) =>
{
    let loginDetailsObj = req.body;

    if (!isInputValid({
        username: USERNAME_VALIDATION_OBJECT.required(),
        password: PASSWORD_VALIDATION_OBJECT.required(),
    }, loginDetailsObj, res))
        return;

    let responseObj = new ResponseObj();
    users.getIdFromUsernameAndPassword(loginDetailsObj.username, loginDetailsObj.password).then(id =>
    {
        responseObj.data = { "token": jwt.sign({ id }, SECRET_KEY) };
        res.send(JSON.stringify(responseObj));
    }).catch(error =>
    {
        responseObj.error = error.message;
        res.status(ERROR_CODES.NOT_FOUND).send(JSON.stringify(responseObj));
    });
});

module.exports = router;