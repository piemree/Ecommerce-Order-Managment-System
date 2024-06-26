const AppError = require('../errors/app.error');
const prisma = require('../prisma');
const { calc } = require('../utils/decimal.util');
const BaseService = require('./base.service');
const BasketService = require('./basket.service');
const productService = require('./product.service');
const settingsService = require('./settings.service');
const campaignService = require('./campaign.service');
const mailService = require('./mail.service');
const { $Enums } = require('@prisma/client');
const { sendMailToQueue } = require('../queue');
const couponService = require('./coupon.service');

class OrderService extends BaseService {
    constructor() {
        super();
        this.model = prisma.order;
    }

    createOrder = async (user, shippingAddress) => {
      
        
        const basket = await BasketService.getBasket(user.id);

        if (!basket) throw new AppError('Basket not found');

        if (basket.items?.length === 0) throw new AppError('Basket is empty');

        const order = await this.model.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
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
                    ...(basket.campaignId && {
                        connect: {
                            id: basket.campaignId,
                        },
                    })
                },
                Coupon: {
                    ...(basket.couponId && {
                        connect: {
                            id: basket.couponId,
                        },
                    })
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
                Coupon: true
            },
        });


        await productService.bulkDecrementProductStock(order.items);

        await BasketService.resetBasket(user.id);
        // await mailService.sendMail(userId, 'Order Created', 'Your order has been created successfully');
        sendMailToQueue({
            userEmail: user.email,
            subject: 'Order Created',
            text: 'Your order has been created successfully',
        })
        return order;
    }

    cancelOrder = async (userId, orderId) => {
        const order = await this.getOrder(userId, orderId)

        if (!order) throw new AppError('Order not found');

        await productService.bulkIncrementProductStock(order.items);

        await couponService.incrementUsage(order.Coupon?.id)
        return this.model.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                status: $Enums.OrderStatus.CANCELLED,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
                Coupon: true
            },
        });
    }

    calculateOrderTotal = async (subtotal, campaignDiscount, couponDiscount) => {
        const settings = await settingsService.getSettings();
        const cargoPrice = subtotal >= settings.minAmountForFreeCargo ? 0 : settings.cargoPrice;
        return calc(subtotal - campaignDiscount - couponDiscount + cargoPrice);
    }

    updateOrderItemQuantity = async (userId, orderId, orderItemId, quantity) => {
        const order = await this.model.findFirst({
            where: {
                id: parseInt(orderId),
                userId,
            },
            include: {
                items: {
                    where: {
                        id: orderItemId,
                    },
                    include: {
                        product: true,
                    }
                },
            },
        });

        if (!order) throw new AppError('Order not found');

        if (order.status !== $Enums.OrderStatus.PROCESSING) throw new AppError('You can not update order after processing');

        if (!order.items || order.items.length === 0) throw new AppError('Order item not found');

        const orderItem = order.items[0];

        const product = orderItem.product;

        const requiredQuantity = quantity - orderItem.quantity;

        if (product.stockQuantity < requiredQuantity) throw new AppError('Not enough stock');

        if (requiredQuantity > 0) await productService.decrementProductStock(product.id, requiredQuantity);
        if (requiredQuantity < 0) await productService.incrementProductStock(product.id, -requiredQuantity);

        const subtotal = order.items.reduce((acc, item) => {
            if (item.id === orderItemId) acc += product.price * quantity;
            else acc += item.product.price * item.quantity;
            return acc;
        }, 0);

        await this.model.update({
            where: {
                id: order.id,
            },
            data: {
                items: {
                    update: {
                        where: {
                            id: orderItemId,
                        },
                        data: {
                            quantity,
                        },
                    },
                },
                subtotal: subtotal,
                total: await this.calculateOrderTotal(subtotal, order.campaignDiscount, order.couponDiscount),
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
                Coupon: true
            },
        });
        return await this.orderControls(userId, orderId);
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
                Coupon: true
            },
        });
    }

    getOrder = async (userId, orderId) => {
        return this.model.findFirst({
            where: {
                id: parseInt(orderId),
                userId
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
                Coupon: true
            },
        });
    }

    updateOrderStatus = async (userId, orderId, status) => {
        // check invalid status
        if (!Object.values($Enums.OrderStatus).includes(status)) throw new AppError('Invalid status');

        const order = await this.model.findFirst({
            where: {
                id: parseInt(orderId),
                userId
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                Campaign: true,
                Coupon: true
            },
        });

        if (!order) throw new AppError('Order not found');

        if (status === $Enums.OrderStatus.CANCELLED) return await this.cancelOrder(userId, orderId);

        return await this.model.update({
            where: {
                id: order.id
            },
            data: { status },
        });
    }

    orderControls = async (userId, orderId) => {
        await this.checkCargo(userId, orderId)
        return await this.applyOrCancelCampaign(userId, orderId)
    }

    checkCargo = async (userId, orderId) => {
        const order = await this.getOrder(userId, orderId);

        if (!order || order.status === $Enums.OrderStatus.CANCELLED) return false;

        const settings = await settingsService.getSettings();
        if (order.subtotal >= settings.minAmountForFreeCargo) {
            return await this.model.update({
                where: {
                    id: order.id
                },
                data: {
                    cargoPrice: 0,
                    total: await this.calculateOrderTotal(order.subtotal, order.campaignDiscount, order.couponDiscount)

                },
                include: {
                    items: true
                }
            });
        }

        if (order.cargoPrice === settings.cargoPrice) return order;

        return await this.model.update({
            where: {
                id: order.id
            },
            data: {
                cargoPrice: settings.cargoPrice,
                total: await this.calculateOrderTotal(order.subtotal, order.campaignDiscount, order.couponDiscount)
            },
            include: {
                items: true
            }
        });

    }

    applyOrCancelCampaign = async (userId, orderId) => {
        const order = await this.getOrder(userId, orderId);

        if (!order || order.status === $Enums.OrderStatus.CANCELLED) return false;

        if (order.items.length === 0) return await this.cancelOrder(userId, orderId);

        const campaign = await campaignService.getSuitableCampaign(order.subtotal)


        if (!campaign && !order.Campaign) return order;

        if (!campaign && order.Campaign) {
            return await this.model.update({
                where: {
                    id: order.id
                },
                data: {
                    Campaign: {
                        disconnect: true
                    },
                    campaignDiscount: 0,
                    totalDiscount: calc(order.totalDiscount - order.campaignDiscount),
                    total: await this.calculateOrderTotal(order.subtotal, 0, order.couponDiscount)
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }

                    },
                    Campaign: true,
                    Coupon: true
                }
            });
        }

        const campaignDiscount = calc(order.subtotal * campaign.discountPct / 100);

        if (order.Campaign && order.Campaign.id === campaign.id) {
            return await this.model.update({
                where: {
                    id: order.id
                },
                data: {
                    campaignDiscount: campaignDiscount,
                    totalDiscount: calc(order.couponDiscount + campaignDiscount),
                    total: await this.calculateOrderTotal(order.subtotal, campaignDiscount, order.couponDiscount)
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    Campaign: true,
                    Coupon: true
                }
            });
        }

        const newOrder = await this.model.update({
            where: {
                id: order.id
            },
            data: {
                Campaign: {
                    connect: {
                        id: campaign.id
                    },
                },
                ...(
                    campaign.giftProductId ? {
                        items: {
                            create: {
                                isGift: true,
                                productId: campaign.giftProductId,
                                quantity: 1
                            }
                        }
                    } : {
                        items: {
                            deleteMany: {
                                isGift: true
                            }
                        }
                    }
                ),
                campaignDiscount: campaignDiscount,
                totalDiscount: calc(order.couponDiscount + campaignDiscount),
                total: await this.calculateOrderTotal(order.subtotal, campaignDiscount, order.couponDiscount)
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                Campaign: true,
                Coupon: true
            }
        });

        return newOrder;

    }
}

module.exports = new OrderService();
