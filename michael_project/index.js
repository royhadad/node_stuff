const ERROR_CODES = require('./errorCodes.js');
const express = require('express');
const Joi = require('joi');
const users = require('./users.js');
const ResponseObj = require('./ResponseObj');
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
PORT_NUMBER = 3000;
const SECRET_KEY = "koala";
const MINIMUM_USERNAME_LENGTH = 3;
const MAXIMUM_USERNAME_LENGTH = 20;

const MINIMUM_PASSWORD_LENGTH = 6;
const MAXIMUM_PASSWORD_LENGTH = 20;

const MINIMUM_FULLNAME_LENGTH = 5;
const MAXIMUM_FULLNAME_LENGTH = 30;

const USERNAME_VALIDATION_OBJECT = Joi.string().min(MINIMUM_USERNAME_LENGTH).max(MAXIMUM_USERNAME_LENGTH).regex(/\w*/);
const PASSWORD_VALIDATION_OBJECT = Joi.string().min(MINIMUM_PASSWORD_LENGTH).max(MAXIMUM_PASSWORD_LENGTH).regex(/\S*/);
const FULLNAME_VALIDATION_OBJECT = Joi.string().min(MINIMUM_FULLNAME_LENGTH).max(MAXIMUM_FULLNAME_LENGTH).regex(/\D*/);
const ABOUT_VALIDATION_OBJECT = Joi.string();

app.get('/api/users/getUser/:id', (req, res) =>
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

app.get('/favicon.ico', (req, res) =>
{
    res.status(ERROR_CODES.NO_CONTENT);
});

app.post('/api/users/createUser', (req, res) =>
{
    let userObj = req.body;
    if (!isInputValidated({
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

app.post('/api/users/login', (req, res) =>
{
    let loginDetailsObj = req.body;

    if (!isInputValidated({
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

app.put('/api/users/editUser', verifyToken, (req, res) =>
{
    let newUserDetailsObj = req.body;

    if (!isInputValidated({
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

app.put('/api/users/changePassword', verifyToken, (req, res) =>
{
    let newPasswordObject = req.body;

    if (!isInputValidated(
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


//FORMAT OF TOKEN
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

function isInputValidated(schema, jsonObj, res)
{
    let responseObj = new ResponseObj();
    if(Object.keys(jsonObj).length===0)
    {
        responseObj.error = "no input inserted to json";
        res.status(ERROR_CODES.BAD_REQUEST).send(JSON.stringify(responseObj));
        return false;
    }
    let validationResult = Joi.validate(jsonObj, schema);
    if (validationResult.error)
    {
        responseObj.error = validationResult.error.details.reduce((sum, current) => { return (sum + current.message + "\n"); }, "");
        res.status(ERROR_CODES.BAD_REQUEST).send(JSON.stringify(responseObj));
        return false;
    }
    return true;
}

app.listen(PORT_NUMBER, () => console.log(`listening on port ${PORT_NUMBER}...`));