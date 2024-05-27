const joi = require("joi")

const loginSchema = {
    email: joi.string().email().required(),
    password: joi.string().required()
}

const registerSchema = {
    email: joi.string().email().required(),
    password: joi.string().required(),
    fullName: joi.string().required()
}

module.exports = {
    loginSchema,
    registerSchema
}