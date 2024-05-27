const prisma = require('../prisma');
const BaseService = require('./base.service');
const cacheService = require('./cache.service');

class ProductService extends BaseService {
    constructor() {
        super();
        this.model = prisma.product;
    }

    getAllProducts = async () => {
        const cachedProducts = await cacheService.get('products');
        if (cachedProducts) return cachedProducts;
        // await 5 secons
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const products = await this.model.findMany({
            include: {
                category: true
            }
        });
        await cacheService.set('products', products, 20);
        return products;
    }

    searchProducts = async (searchTerm) => {
        console.log('searchTerm', searchTerm);
        return this.model.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm } },
                    // { description: { contains: searchTerm } },
                    // { origin: { contains: searchTerm } },
                    // { flavorNotes: { contains: searchTerm } }
                ]
            },
            //limit
            take: 1
        });
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

    bulkDecrementProductStock = async (orderItems = []) => {
        return prisma.$transaction(orderItems.map((orderItem) => {
            return this.model.update({
                where: { id: orderItem?.productId },
                data: {
                    stockQuantity: {
                        decrement: orderItem.quantity
                    }
                }
            })
        }));
    }

    bulkIncrementProductStock = async (orderItems = []) => {
        return prisma.$transaction(orderItems.map((orderItem) => {
            return this.model.update({
                where: { id: orderItem?.productId },
                data: {
                    stockQuantity: {
                        increment: orderItem.quantity
                    }
                }
            })
        }));
    }

    decrementProductStock = async (id, quantity = 1) => {
        return this.model.update({
            where: { id },
            data: {
                stockQuantity: {
                    decrement: quantity
                }
            }
        });
    }

    incrementProductStock = async (id, quantity = 1) => {
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
