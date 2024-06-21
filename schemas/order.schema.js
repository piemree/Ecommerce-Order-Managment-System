const { $Enums } = require("@prisma/client")
const joi = require("joi")

const createOrderSchema = {
    shippingAddress: joi.string().required(),
}

const updateOrderQuantitySchema = {

    itemId: joi.number().min(0).required(),
    quantity: joi.number().min(0).required()

}

const updateOrderStatusSchema = {
    status: joi.string().valid(...Object.values($Enums.OrderStatus)).required()
}



module.exports = {
    createOrderSchema,
    updateOrderQuantitySchema,
    updateOrderStatusSchema
}