const prisma = require('../prisma');
const BaseService = require('./base.service');
const BasketService = require('./basket.service');

class OrderService extends BaseService {
    constructor() {
        super();
        this.model = prisma.order;
    }

    createOrder = async (userId) => {
        const userBasket = await BasketService.getBasket(userId);




    }
}

module.exports = new OrderService();
