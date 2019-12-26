const express = require('express');
const Joi = require('joi');
const app = express();
PORT_NUMBER = 3000;


app.get('/aba', (req, res) =>{
    res.send("responding!");
})

app.post('/aba', (req, res) =>{

    res.send("added!");
});

app.listen(PORT_NUMBER, ()=>console.log(`listening on port ${PORT_NUMBER}...`));