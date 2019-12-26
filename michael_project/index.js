const express = require('express');
const Joi = require('joi');
const users = require('./users.js');
const ResponseObj = require('./ResponseObj');
const app = express();
app.use(express.json());
PORT_NUMBER = 3000;
const minimumUsernameLength = 3;
const maximumUsernameLength = 20;

const minimumPasswordLength = 6;
const maximumPasswordLength = 20;

const minimumFullNameLength = 5;
const maximumFullNameLength = 30;

app.get('/users/getUser/:id', (req, res) =>
{
    let responseObj = new ResponseObj();
    users.getUserById(req.params.id)
        .then((result) =>
        {
            if (result)
                responseObj.data = result;
            else
                responseObj.error = new Error("user not found!");
            res.send(JSON.stringify(responseObj));
        })
        .catch((error) =>
        {
            responseObj.error = error;
            res.status(400).send(JSON.stringify(responseObj));
        });
});

app.get('/favicon.ico', (req, res) =>
{
    res.status(204);
});

app.post('/users/createUser', (req, res) =>
{
    let responseObj = new ResponseObj();
    let userObj = req.body;
    const schema = {
        username: Joi.string().min(minimumUsernameLength).max(maximumUsernameLength).regex(/\w*/).required(),
        password: Joi.string().min(minimumPasswordLength).max(maximumPasswordLength).regex(/\S*/).required(),
        full_name: Joi.string().min(minimumFullNameLength).max(maximumFullNameLength).regex(/\D*/).required(),
        about: Joi.string().required()
    };
    let validationResult = Joi.validate(userObj, schema);
    if (validationResult.error)
    {
        responseObj.error = validationResult.error.details.reduce((sum, current) => sum + current + "\n", "");
        res.status(500).send(responseObj);
    }
    else
    {
        users.createUser(userObj)
            .then((result) =>
            {
                if (result)
                    responseObj.data = result;
                else
                    responseObj.error = new Error("couldnt create new user!");
                res.status(500).send(JSON.stringify(responseObj));
            })
            .catch((error) =>
            {
                responseObj.error = error;
                res.status(400).send(JSON.stringify(responseObj));
            });
    }
});

app.post('users/login', (req, res) =>
{
    let responseObj = new ResponseObj();
    let loginDetailsObj = req.body;
    const schema = {
        username: Joi.string().min(minimumUsernameLength).max(maximumUsernameLength).regex(/\w*/).required(),
        password: Joi.string().min(minimumPasswordLength).max(maximumPasswordLength).regex(/\S*/).required(),
    };
    let validationResult = Joi.validate(loginDetailsObj, schema);
    if (validationResult.error)
    {
        responseObj.error = validationResult.error.details.reduce((sum, current) => sum + current + "\n", "");
        res.status(400).send(responseObj);
    }
    else
    {
        //get authorization key!
        res.send("authorization_key_place_holder");
    }
});

app.put('/users/editUser', (req, res) =>
{
    let responseObj = new ResponseObj();
    //check for auth

    




});

app.put('/users/changePassword', (req, res) =>
{
    let responseObj = new ResponseObj();
    //check for auth




});

app.listen(PORT_NUMBER, () => console.log(`listening on port ${PORT_NUMBER}...`));