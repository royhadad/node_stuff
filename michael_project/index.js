const express = require('express');
const Joi = require('joi');
const users = require('./users.js');
const ResponseObj = require('./ResponseObj');
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
PORT_NUMBER = 3000;
const SECRET_KEY = "koala";
const minimumUsernameLength = 3;
const maximumUsernameLength = 20;

const minimumPasswordLength = 6;
const maximumPasswordLength = 20;

const minimumFullNameLength = 5;
const maximumFullNameLength = 30;

app.get('/api/users/getUser/:id', (req, res) =>
{
    let responseObj = new ResponseObj();
    users.getUserById(req.params.id)
        .then((result) =>
        {
            if (result)
                responseObj.data = result;
            else
                responseObj.error = "user not found!";
            res.send(JSON.stringify(responseObj));
        })
        .catch((error) =>
        {
            responseObj.error = error.message;
            res.status(400).send(JSON.stringify(responseObj));
        });
});

app.get('/favicon.ico', (req, res) =>
{
    res.status(204);
});

app.post('/api/users/createUser', (req, res) =>
{
    let userObj = req.body;
    if (!isInputValidated({
        username: Joi.string().min(minimumUsernameLength).max(maximumUsernameLength).regex(/\w*/).required(),
        password: Joi.string().min(minimumPasswordLength).max(maximumPasswordLength).regex(/\S*/).required(),
        fullName: Joi.string().min(minimumFullNameLength).max(maximumFullNameLength).regex(/\D*/).required(),
        about: Joi.string().required()
    }, userObj, res))
        return;

    let responseObj = new ResponseObj();
    users.createUser(userObj)
        .then((result) =>
        {
            if (result)
            {
                responseObj.data = result;
                res.send(JSON.stringify(responseObj));
            }
            else
            {
                responseObj.error = "couldnt create new user!";
                res.status(500).send(JSON.stringify(responseObj));
            }
        })
        .catch((error) =>
        {
            responseObj.error = error.message;
            res.status(400).send(JSON.stringify(responseObj));
        });
});

app.post('/api/users/login', (req, res) =>
{
    let loginDetailsObj = req.body;

    if (!isInputValidated({
        username: Joi.string().min(minimumUsernameLength).max(maximumUsernameLength).regex(/\w*/).required(),
        password: Joi.string().min(minimumPasswordLength).max(maximumPasswordLength).regex(/\S*/).required(),
    }, loginDetailsObj, res))
        return;

    let responseObj = new ResponseObj();
    users.getIdFromUsernameAndPassword(loginDetailsObj.username, loginDetailsObj.password).then(id =>
    {
        responseObj.data = { "token": jwt.sign({ id }, SECRET_KEY) };
        res.send(JSON.stringify(responseObj));
    }).catch(error =>
    {   
        console.log(error);
        
        responseObj.error = error.message;
        res.status(500).send(JSON.stringify(responseObj));
    });
});

app.put('/api/users/editUser', verifyToken, (req, res) =>
{
    let newUserDetailsObj = req.body;

    if (!isInputValidated({
        username: Joi.string().min(minimumUsernameLength).max(maximumUsernameLength).regex(/\w*/),
        fullName: Joi.string().min(minimumFullNameLength).max(maximumFullNameLength).regex(/\D*/),
        about: Joi.string()
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
        res.status(404).send(JSON.stringify(responseObj));
    });
});

app.put('/api/users/changePassword', verifyToken, (req, res) =>
{
    let newPasswordObject = req.body;

    if (!isInputValidated(
        { password: Joi.string().min(minimumPasswordLength).max(maximumPasswordLength).regex(/\S*/).required() }
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
        res.status(404).send(JSON.stringify(responseObj));
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
        res.status(403).send(JSON.stringify(responseObj));
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
            res.status(403).send(JSON.stringify(responseObj));
        }
    }
}

function isInputValidated(schema, jsonObj, res)
{
    let responseObj = new ResponseObj();
    let validationResult = Joi.validate(jsonObj, schema);
    if (validationResult.error)
    {
        responseObj.error = validationResult.error.details.reduce((sum, current) => { return (sum + current.message + "\n"); }, "");
        res.status(400).send(JSON.stringify(responseObj));
        return false;
    }
    return true;
}

app.listen(PORT_NUMBER, () => console.log(`listening on port ${PORT_NUMBER}...`));