const prisma = require('../prisma');
const BaseService = require('./base.service');

class ProductService extends BaseService {
    constructor() {
        super();
        this.model = prisma.product;
    }

    checkProductStock = async (id, quantity) => {
        const product = await this.model.findFirst({
            where: { id },
            select: {
                stock_quantity: true
            }
        })

        return product.stock_quantity >= quantity
    }
}

module.exports = new ProductService();
