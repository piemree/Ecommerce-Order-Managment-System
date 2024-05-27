const { verifyUser } = require("../services/auth.service");
const AppError = require("../errors/App.error");
const _ = require("lodash");

async function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return next(AppError.Unauthorized());

    try {
        const user = await verifyUser(token);
        if (!user) return next(AppError.Unauthorized());
        req.user = _.pick(user, ["id", "email"]);
        next();
    } catch (error) {
        next(AppError.Unauthorized());
    }
}

module.exports = authenticate;