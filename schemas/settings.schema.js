const joi = require("joi")

const updateSettingsSchema = {
    cargoPrice: joi.number().min(0).required(),
    minAmountForFreeCargo: joi.number().min(0).required(),
}

module.exports = {
    updateSettingsSchema
}