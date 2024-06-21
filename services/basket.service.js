const prisma = require('../prisma');
const BaseService = require('./base.service');
const productService = require('./product.service');
const campaignService = require('./campaign.service');
const settingsService = require('./settings.service');
const couponService = require('./coupon.service');
const AppError = require('../errors/app.error');
const { calc } = require('../utils/decimal.util');

class BasketService extends BaseService {
    constructor() {
        super();
        this.model = prisma.basket;
    }

    getBasket = async (userId) => {
        const basket = await this.model.findFirst({
            where: {
                userId
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
        if (basket) return basket;

        return await this.model.create({
            data: {
                user: {
                    connect: {
                        id: userId
                    }
                }
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

    addItem = async (userId, productId, quantity = 1) => {
        const basketPromise = this.model.findFirst({
            where: {
                userId
            },
            include: {
                items: true
            }
        });
        const productPromise = productService.findProductById(productId);

        const [basket, product] = await Promise.all([basketPromise, productPromise]);

        if (!product) throw new Error('Product not found');

        if (!basket) {
            await this.model.create({
                data: {
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    items: {
                        create: {
                            productId,
                            quantity: quantity ? quantity : 1
                        }
                    }
                },
                include: {
                    items: true
                }
            })
            return await this.basketControls(userId);
        }

        const item = basket.items.find(item => item.productId === productId);

        if (item) {
            await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    items: {
                        update: {
                            where: {
                                id: item.id
                            },
                            data: {
                                quantity: {
                                    increment: quantity
                                }
                            }
                        }
                    },
                    subtotal: calc(basket.subtotal + (quantity * product.price)),
                    total: calc(basket.total + (quantity * product.price))
                },
                include: {
                    items: true
                }
            });
            return await this.basketControls(userId);
        }

        const subtotal = calc(basket.subtotal + (quantity * product.price));

        await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                items: {
                    create: {
                        productId,
                        quantity: quantity ? quantity : 1
                    }
                },
                subtotal: subtotal,

                total: await this.calculateBasketTotal(subtotal, basket.campaignDiscount, basket.couponDiscount)

            },
            include: {
                items: true
            }
        });
        return await this.basketControls(userId);

    }

    resetBasket = async (userId) => {
        const basket = await this.getBasket(userId)


        if (!basket) return false;
        if (basket.Coupon) await couponService.incrementUsage(basket.Coupon?.id)

        return await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                items: {
                    deleteMany: {}
                },
                Campaign: {
                    disconnect: true
                },
                Coupon: {
                    disconnect: true
                },
                cargoPrice: 0,
                campaignDiscount: 0,
                couponDiscount: 0,
                totalDiscount: 0,
                total: 0,
                subtotal: 0
            },
            include: {
                items: true
            }
        });
    }

    removeItem = async (userId, basketItemId) => {
        const basket = await prisma.basket.findFirst({
            where: {
                userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!basket) return basket

        const basketItem = basket.items.find(item => item.id === basketItemId);

        if (basket.items.length === 1 && basketItem.id == basketItemId) {
            return await this.resetBasket(userId);
        }

        const subtotal = calc(basket.subtotal - (basketItem.product.price * basketItem.quantity));

        await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                items: {
                    disconnect: {
                        id: basketItemId
                    }
                },
                subtotal: subtotal,
                total: await this.calculateBasketTotal(subtotal, basket.campaignDiscount, basket.couponDiscount)

            },
            include: {
                items: true
            }
        });

        return await this.basketControls(userId);
    }

    updateItemQuantity = async (userId, basketItemId, quantity) => {
        const basket = await this.model.findFirst({
            where: {
                userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!basket) return false;

        const item = basket.items.find(item => item.id === basketItemId);

        if (!item) return basket;

        if (quantity <= 0) await this.resetBasket(userId)

        const isStockAvailable = await productService.isProductStockAvailable(item.productId, quantity);
        if (!isStockAvailable) throw new AppError('Stock not available');

        const oldPrice = calc(item.product.price * item.quantity) //item.product.price * item.quantity;
        const newPrice = calc(item.product.price * quantity) //item.product.price * quantity; 
        const netPrice = calc(newPrice - oldPrice) //newPrice - oldPrice;


        await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                items: {
                    update: {
                        where: {
                            id: item.id
                        },
                        data: {
                            quantity
                        }
                    }
                },
                subtotal: calc(basket.subtotal + netPrice),
                total: await this.calculateBasketTotal(basket.subtotal + netPrice, basket.campaignDiscount, basket.couponDiscount)
            },
            include: {
                items: true
            }
        });

        return await this.basketControls(userId);
    }

    calculateBasketTotal = async (subtotal, campaignDiscount, couponDiscount) => {
        const settings = await settingsService.getSettings();
        const cargoPrice = subtotal >= settings.minAmountForFreeCargo ? 0 : settings.cargoPrice;
        return calc(subtotal - campaignDiscount - couponDiscount + cargoPrice);
    }

    basketControls = async (userId) => {
        await this.checkCargo(userId)
        return await this.applyOrCancelCampaign(userId)
    }


    checkCargo = async (userId) => {
        const basket = await this.getBasket(userId);

        if (!basket) return false;

        if (basket.items.length === 0) return await this.resetBasket(userId);

        const settings = await settingsService.getSettings();
        if (basket.subtotal >= settings.minAmountForFreeCargo) {
            return await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    cargoPrice: 0,
                    total: await this.calculateBasketTotal(basket.subtotal, basket.campaignDiscount, basket.couponDiscount)

                },
                include: {
                    items: true
                }
            });
        }

        if (basket.cargoPrice === settings.cargoPrice) return basket;

        // const netCargoPrice = Math.abs(calc(basket.cargoPrice - settings.cargoPrice))

        return await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                cargoPrice: settings.cargoPrice,
                total: await this.calculateBasketTotal(basket.subtotal, basket.campaignDiscount, basket.couponDiscount)
            },
            include: {
                items: true
            }
        });

    }

    applyOrCancelCampaign = async (userId) => {
        const basket = await this.getBasket(userId);

        if (!basket) return false;
        if (basket.items.length === 0) return await this.resetBasket(userId);

        const campaign = await campaignService.getSuitableCampaign(basket.subtotal)


        if (!campaign && !basket.Campaign) return basket;

        // if there is no campaign and there is a campaign in the basket then remove the campaign
        if (!campaign && basket.Campaign) {
            return await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    Campaign: {
                        disconnect: true
                    },
                    campaignDiscount: 0,
                    totalDiscount: calc(basket.totalDiscount - basket.campaignDiscount),
                    total: await this.calculateBasketTotal(basket.subtotal, 0, basket.couponDiscount)
                },
                include: {
                    items: true,
                    Campaign: true,
                    Coupon: true
                }
            });
        }

        const campaignDiscount = calc(basket.subtotal * campaign.discountPct / 100);

        if (basket.Campaign && basket.Campaign.id === campaign.id) {
            return await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    campaignDiscount: campaignDiscount,
                    totalDiscount: calc(basket.couponDiscount + campaignDiscount),
                    total: await this.calculateBasketTotal(basket.subtotal, campaignDiscount, basket.couponDiscount)
                },
                include: {
                    items: true,
                    Campaign: true,
                    Coupon: true
                }
            });
        }


        const newBasket = await this.model.update({
            where: {
                id: basket.id
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
                totalDiscount: calc(basket.couponDiscount + campaignDiscount),
                total: await this.calculateBasketTotal(basket.subtotal, campaignDiscount, basket.couponDiscount)
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

        return newBasket;

    }

    applyCoupon = async (userId, couponCode) => {
        const basket = await this.getBasket(userId);

        if (!basket) return false;
        if (basket.items.length === 0) return await this.resetBasket(userId);
        if (basket.Coupon) throw new AppError('Coupon already applied')
        const coupon = await couponService.isCouponCodeAvailable(userId, couponCode);
        if (!coupon) throw new AppError('Invalid coupon code');

        await couponService.incrementUsage(coupon.id)

        if (coupon.isPercent) {
            const couponDiscount = calc(basket.subtotal * coupon.discountPct / 100);
            return await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    Coupon: {
                        connect: {
                            id: coupon.id
                        }
                    },
                    couponDiscount: couponDiscount,
                    totalDiscount: calc(basket.campaignDiscount + couponDiscount),
                    total: await this.calculateBasketTotal(basket.subtotal, basket.campaignDiscount, couponDiscount)
                },
                include: {
                    items: true,
                    Campaign: true,
                    Coupon: true
                }
            });

        }

        return await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                Coupon: {
                    connect: {
                        id: coupon.id
                    }
                },
                couponDiscount: coupon.discount,
                totalDiscount: calc(basket.campaignDiscount + coupon.discount),
                total: await this.calculateBasketTotal(basket.subtotal, basket.campaignDiscount, coupon.discount)
            },
            include: {
                items: true,
                Campaign: true,
                Coupon: true
            }
        });


    }

    cancelCurrentCoupon = async (userId) => {
        const basket = await this.getBasket(userId)
        if (!basket) return basket;
        if (!basket.Coupon) return basket
        const coupon = basket.Coupon

        await couponService.decrementUsage(coupon.id)

        return await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                Coupon: {
                    disconnect: {
                        id: coupon.id
                    }
                },
                couponDiscount: 0,
                totalDiscount: basket.campaignDiscount,
                total: await this.calculateBasketTotal(basket.subtotal, basket.campaignDiscount, 0)
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
}

module.exports = new BasketService();
