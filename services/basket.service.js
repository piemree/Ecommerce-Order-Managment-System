const prisma = require('../prisma');
const BaseService = require('./base.service');

class BasketService extends BaseService {
    constructor() {
        super();
        this.model = prisma.basket;
    }
}

module.exports = new BasketService();
