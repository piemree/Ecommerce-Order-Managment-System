const Joi = require('joi');
function validateSchema(obj ) {
    return (req, res, next) => {
        const schema = Joi.object(obj);
        const { error } = schema.validate(req.body, { stripUnknown: true });
        if (error) return next(error);
        next();
    };
}

module.exports = validateSchema