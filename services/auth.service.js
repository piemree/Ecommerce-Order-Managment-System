const prisma = require('../prisma');
const BaseService = require('./base.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../errors/App.error');
const _ = require('lodash');

class AuthService extends BaseService {
    constructor() {
        super();
        this.model = prisma.user;
    }

    login = async (data) => {
        const user = await this.model.findUnique({
            where: {
                email: data.email,
            },
        });
        if (!user) throw new AppError('Invalid email or password', 400)

        const isPasswordValid = await this.comparePassword(data.password, user.password);

        if (!isPasswordValid) throw new AppError('Invalid email or password', 400)


        return await this.generateToken(user);
    }

    comparePassword = async (password, hash) => {
        return bcrypt.compare(password, hash);
    }

    hashPassword = async (password) => {
        return bcrypt.hash(password, 10);
    }


    register = async (data) => {
        data.password = await this.hashPassword(data.password);
        const user = await this.model.create({ data });
        return _.omit(user, ['password']);
    }

    generateToken = async (user) => {
        return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
    }

    verifyToken = async (token) => {
        return jwt.verify(token, process.env.JWT_SECRET);
    }

    verifyUser = async (token) => {
        const { userId } = await this.verifyToken(token)
        return this.model.findFirst({
            where: {
                id: userId,
            },
        });
    }

}

module.exports = new AuthService();
