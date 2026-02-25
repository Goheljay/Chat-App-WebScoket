const Joi = require("joi");

const userValidationSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().min(5).required(),
  password: Joi.string().min(6).max(30).required(),
});

const loginValidationSchema = Joi.object({
    email: Joi.string().min(5).required(),
    password: Joi.string().min(6).max(30).required(),
});

module.exports = {
    userValidationSchema,
    loginValidationSchema
};
