const authService = require('../services/auth.service.js');

async function login(req, res) {
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
        }
        const token = await authService.login(data);
        res.json({ token });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function register(req, res) {
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
            fullName: req.body.fullName,
        }
        const user = await authService.register(data);
        res.json(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
module.exports = {
    login,
    register
};