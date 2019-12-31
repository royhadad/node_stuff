//TODO
//make secret variables actually secured
//use express routes

const secretVariables = require('./secretVariables.js');
const ERROR_CODES = require('./errorCodes.js');
const express = require('express');
const users = require('./users.js');
const ResponseObj = require('./ResponseObj.js');
const { isInputValid, USERNAME_VALIDATION_OBJECT, PASSWORD_VALIDATION_OBJECT, FULLNAME_VALIDATION_OBJECT, ABOUT_VALIDATION_OBJECT } = require('./inputValidation.js');
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
PORT_NUMBER = 3000;
const SECRET_KEY = secretVariables.SECRET_KEY;

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

app.post('/api/users/login', (req, res) =>
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

app.put('/api/users/editUser', verifyToken, (req, res) =>
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

app.put('/api/users/changePassword', verifyToken, (req, res) =>
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

app.listen(PORT_NUMBER, () => console.log(`listening on port ${PORT_NUMBER}...`));