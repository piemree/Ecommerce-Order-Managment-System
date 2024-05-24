const prisma = require('../prisma');
const BaseService = require('./base.service');

class UserService extends BaseService {
    constructor() {
        super();
        this.model = prisma.user;
    }
}

module.exports = new UserService();
