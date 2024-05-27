const joi = require("joi")

const createProductSchema = {
    title: joi.string().required(),
    categoryId: joi.number(),
    description: joi.string().required(),
    price: joi.number().required(),
    stockQuantity: joi.number().required(),
    origin: joi.string().required(),
    roastLevel: joi.string().required(),
    flavorNotes: joi.array().items(joi.string())
}


const updateProductStockSchema = {
    productId: joi.number().required(),
    stockQuantity: joi.number().required(),
}



module.exports = {
    createProductSchema,
    updateProductStockSchema
}