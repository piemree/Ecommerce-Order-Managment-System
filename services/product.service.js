const prisma = require('../prisma');
const BaseService = require('./base.service');

class ProductService extends BaseService {
    constructor() {
        super();
        this.model = prisma.product;
    }

    findProductById = async (id) => {
        return this.model.findUnique({
            where: { id }
        });
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

    updateProductStock = async (id, quantity) => {
        return this.model.update({
            where: { id },
            data: {
                stockQuantity: {
                    increment: quantity
                }
            }
        });
    }

    isProductStockAvailable = async (id, quantity = 1) => {
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
