const joi = require("joi")

const addItemToBasketSchema = {
    productId: joi.number().min(1).required(),
    quantity: joi.number().min(1)
}

const applyCouponToBasketSchema = {
    couponCode: joi.string().required()
}

const removeItemFromBasketSchema = {
    basketItemId: joi.number().min(1).required()
}

const updateBasketItemQuantitySchema = {
    basketItemId: joi.number().min(1).required(),
    quantity: joi.number().min(1).required()
}



module.exports = {
    addItemToBasketSchema,
    applyCouponToBasketSchema,
    removeItemFromBasketSchema,
    updateBasketItemQuantitySchema
}