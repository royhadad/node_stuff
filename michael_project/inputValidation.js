const Joi = require('joi');

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


function isInputValid(schema, jsonObj, res)
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
module.exports = isInputValid;