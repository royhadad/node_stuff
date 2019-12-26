const express = require('express');
const Joi = require('joi');

const app = express();
app.use(express.json());

const PORT_NUMBER = process.env.PORT || 3000;

let courses = [
    { id: 1, name: "course1" },
    { id: 2, name: "course2" },
    { id: 3, name: "course3" }
];

app.get('/', (req, res) =>
{
    res.send("Hello World");
});

app.get('/api/courses/:id', (req, res) =>
{
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send("the course with the givan id was not found!");
    else res.send(course);
});

app.post('/api/courses', (req, res) =>
{
    const { error } = validateCourse(res.body);
    if (error) return res.status(400).send(error.details.reduce((currentSum, currentValue) => currentSum + currentValue.message + "\n", ""));
    let values = req.body;
    courses.push({ id: courses.length + 1, name: values.name });
    res.send(values.name + " was added");
});

app.put('/api/courses/:id', (req, res) =>
{
    const { error } = validateCourse(res.body);
    if (error) return res.status(400).send(error.details.reduce((currentSum, currentValue) => currentSum + currentValue.message + "\n", ""));
    let courseName = req.body.name;
    const courseFound = courses.find(c => c.id === parseInt(req.params.id));
    if (!courseFound) return res.status(404).send("the course with the givan id was not found!");
    courseFound.name = courseName;
    res.send(`course with id ${courseFound.id} was updated to name ${courseFound.name}`);
});

function validateCourse(course)
{
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(course, schema);
}

app.listen(PORT_NUMBER, () => console.log(`Listening on port ${PORT_NUMBER}`));