const prisma = require('../prisma');
const BaseService = require('./base.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await this.comparePassword(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

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
        const { userId } = this.verifyToken(token)
        console.log(this);
        return this.model.findUnique({
            where: {
                id: userId,
            },
        });
    }

}

module.exports = new AuthService();
