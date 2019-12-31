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

router.put('/api/users/editUser', verifyToken, (req, res) =>
{
    let newUserDetailsObj = req.body;

    if (!isInputValid({
        username: USERNAME_VALIDATION_OBJECT,
        fullName: FULLNAME_VALIDATION_OBJECT,
        about: ABOUT_VALIDATION_OBJECT
    }, newUserDetailsObj, res))
        return;

    let responseObj = new ResponseObj();
    let tokenBody = jwt.decode(req.token);
    let id = tokenBody.id;
    users.updateUserDetails(id, newUserDetailsObj).then(queryResults =>
    {
        responseObj.data = queryResults;
        res.send(JSON.stringify(responseObj));
    }).catch(error =>
    {
        responseObj.error = error.message;
        res.status(ERROR_CODES.BAD_REQUEST).send(JSON.stringify(responseObj));
    });
});

router.put('/api/users/changePassword', verifyToken, (req, res) =>
{
    let newPasswordObject = req.body;

    if (!isInputValid(
        { password: PASSWORD_VALIDATION_OBJECT.required() }
        , newPasswordObject, res))
        return;

    let responseObj = new ResponseObj();
    let newPassword = newPasswordObject.password;
    let tokenBody = jwt.decode(req.token);
    let id = tokenBody.id;
    users.changePassword(id, newPassword).then(queryResults =>
    {
        responseObj.data = queryResults;
        res.send(JSON.stringify(responseObj));
    }).catch(error =>
    {
        responseObj.error = error.message;
        console.log(error);
        res.status(ERROR_CODES.BAD_REQUEST).send(JSON.stringify(responseObj));
    });
});

//FORMAT OF TOKEN:
//auth: Bearer <access_token>
function verifyToken(req, res, next)
{
    let responseObj = new ResponseObj();
    const bearerHeader = req.headers['auth'];
    if (typeof bearerHeader === 'undefined')
    {
        responseObj.error = "undefind auth";
        res.status(ERROR_CODES.UNAUTHORIZED).send(JSON.stringify(responseObj));
    }
    else
    {
        req.token = bearerHeader.split(' ')[1];
        try
        {
            let jwtResponse = jwt.verify(req.token, SECRET_KEY);
            next();
        }
        catch (error)
        {
            responseObj.error = error.message;
            res.status(ERROR_CODES.UNAUTHORIZED).send(JSON.stringify(responseObj));
        }
    }
}

module.exports = router;