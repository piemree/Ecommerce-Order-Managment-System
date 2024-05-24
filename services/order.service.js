const prisma = require('../prisma');
const BaseService = require('./base.service');
const BasketService = require('./basket.service');

class OrderService extends BaseService {
    constructor() {
        super();
        this.model = prisma.order;
    }

    create = async (userId) => {
        const userBasket = await BasketService.findFirst({
            where: {
                userId
            }
        })

        if (!userBasket) {
            throw new Error('Basket not found');
        }

        console.log(userBasket);


    }
}

module.exports = new OrderService();
