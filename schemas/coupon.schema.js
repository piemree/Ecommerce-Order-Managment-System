const joi = require("joi")

const createCouponSchema = {
    code: joi.string().required(),
    name: joi.string().required(),
    isActive: joi.boolean().required(),
    isPercent: joi.boolean().required(),
    discountPct: joi.number().min(0).required(),
    discount: joi.number().min(0).required(),
    usageLimit: joi.number().min(0).required(),
    usageCount: joi.number().min(0).required()
}

module.exports = {
    createCouponSchema
}