const AppError = require('../errors/app.error');
const prisma = require('../prisma');
const BaseService = require('./base.service');
const BasketService = require('./basket.service');

class OrderService extends BaseService {
    constructor() {
        super();
        this.model = prisma.order;
    }

    createOrder = async (userId, shippingAddress) => {
        const basket = await BasketService.getBasket(userId);

        if (!basket) throw new AppError('Basket not found');

        const order = await this.model.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                cargoPrice: basket.cargoPrice,
                totalPrice: basket.totalPrice,
                totalQuantity: basket.totalQuantity,
                campaignDiscount: basket.campaignDiscount,
                couponDiscount: basket.couponDiscount,
                totalDiscount: basket.totalDiscount,
                shippingAddress: shippingAddress,
                subtotal: basket.subtotal,
                total: basket.total,
                items: {
                    create: basket.items.map((item) => ({
                        product: {
                            connect: {
                                id: item.product.id,
                            },
                        },
                        quantity: item.quantity,
                        isGift: item.isGift,
                    })),
                },
                Campaign: {
                    connect: {
                        id: basket.campaignId,
                    },
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
            },
        });

        await BasketService.resetBasket(userId);

        return order;
    }

    getOrders = async (userId) => {
        return this.model.findMany({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
            },
        });
    }
}

module.exports = new OrderService();
