const joi = require("joi")

const createCampaignSchema = {
    name: joi.string().required(),
    discountPct: joi.number().min(0).required(),
    giftProductId: joi.number().min(1).required(),
    minAmount: joi.number().min(1).required()
}

module.exports = {
    createCampaignSchema
}