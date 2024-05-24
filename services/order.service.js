const prisma = require('../prisma');
const BaseService = require('./base.service');

class OrderService extends BaseService {
    constructor() {
        super();
        this.model = prisma.order;
    }
}

module.exports = new OrderService();
