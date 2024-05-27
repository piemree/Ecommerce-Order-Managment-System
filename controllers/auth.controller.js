const authService = require('../services/auth.service.js');
const AppError = require('../errors/index.js');

async function login(req, res, next) {
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
        }
        const token = await authService.login(data);
        res.json({ token });
    } catch (error) {
        next(error);
    }
}

async function register(req, res, next) {
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
            fullName: req.body.fullName,
        }
        const user = await authService.register(data);
        res.json(user);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    login,
    register
};