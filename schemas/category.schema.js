const joi = require("joi")

const createCategorySchema = {
    title: joi.string().email().required(),
    description: joi.string().required()
}



module.exports = {
    createCategorySchema
}