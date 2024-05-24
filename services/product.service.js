const prisma = require('../prisma');
const BaseService = require('./base.service');

class ProductService extends BaseService {
    constructor() {
        super();
        this.model = prisma.product;
    }

    createProduct = async (data, categoryId) => {
        return this.model.create({
            data: {
                category: {
                    connect: {
                        id: categoryId
                    },
                },
                ...data
            }
        });
    }

    checkProductStock = async (id, quantity) => {
        const product = await this.model.findFirst({
            where: { id },
            select: {
                stockQuantity: true
            }
        })

        return product.stockQuantity >= quantity
    }
}

module.exports = new ProductService();
