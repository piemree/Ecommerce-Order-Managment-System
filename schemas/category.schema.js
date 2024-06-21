const joi = require("joi")

const createCategorySchema = {
    title: joi.string().required(),
    description: joi.string().required()
}



module.exports = {
    createCategorySchema
}