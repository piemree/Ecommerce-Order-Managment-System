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
                Campaign: true
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
                Campaign: true
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
            return await this.model.create({
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
                subtotal: calc(basket.subtotal + (quantity * product.price)),

                total: calc(basket.total + (quantity * product.price))

            },
            include: {
                items: true
            }
        });
        return await this.basketControls(userId);

    }

    resetBasket = async (userId) => {
        const basket = await this.model.findFirst({
            where: {
                userId
            },
            include: {
                items: true
            }
        });

        if (!basket) return false;

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

    removeItem = async (userId, productId) => {
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

        const basketItem = basket.items.find(item => item.productId === productId);

        if (!basketItem) return await this.resetBasket(userId);

        if (basket.items.length === 1) {
            return await this.resetBasket(userId);
        }

        await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                items: {
                    deleteMany: {
                        productId
                    }
                },
                subtotal: calc(basket.subtotal - (basketItem.product.price * basketItem.quantity)),
                total: calc(basket.total - (basketItem.product.price * basketItem.quantity))

            },
            include: {
                items: true
            }
        });

        return await this.basketControls(userId);
    }

    updateItemQuantity = async (userId, productId, quantity) => {
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

        const item = basket.items.find(item => item.productId === productId);

        if (!item) return basket;

        if (quantity <= 0) await this.resetBasket(userId)

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
                total: calc(basket.total + netPrice)
            },
            include: {
                items: true
            }
        });

        return await this.basketControls(userId);
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
                    total: calc(basket.total - basket.cargoPrice)

                },
                include: {
                    items: true
                }
            });
        }

        if (basket.cargoPrice === settings.cargoPrice) return basket;

        const netCargoPrice = Math.abs(calc(basket.cargoPrice - settings.cargoPrice))

        return await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                cargoPrice: settings.cargoPrice,
                total: calc(basket.total + netCargoPrice)
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
                    total: calc(basket.total + basket.campaignDiscount)
                },
                include: {
                    items: true,
                    Campaign: true
                }
            });
        }

        if (basket.Campaign && basket.Campaign.id === campaign.id) return basket;

        const campaignDiscount = calc(basket.subtotal * campaign.discountPct / 100);

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
                total: calc(basket.total - campaignDiscount)
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                Campaign: true
            }
        });

        return newBasket;

    }

    applyCoupon = async (userId, couponCode) => {
        const basket = await this.getBasket(userId);

        if (!basket) return false;
        if (basket.items.length === 0) return await this.resetBasket(userId);

        const coupon = await couponService.isCouponCodeAvailable(userId, couponCode);
        if (!coupon) throw new AppError('Invalid coupon code');


        if (coupon.isPercent) {
            const couponDiscount = calc(basket.subtotal * coupon.discountPct / 100);
            return await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    couponDiscount: couponDiscount,
                    totalDiscount: calc(basket.campaignDiscount + couponDiscount),
                    total: calc(basket.total - couponDiscount)
                },
                include: {
                    items: true,
                    Campaign: true
                }
            });

        }

        return await this.model.update({
            where: {
                id: basket.id
            },
            data: {
                couponDiscount: coupon.discount,
                totalDiscount: calc(basket.campaignDiscount + coupon.discount),
                total: calc(basket.total - (coupon.discount > basket.total ? basket.total : coupon.discount))
            },
            include: {
                items: true,
                Campaign: true
            }
        });


    }
}

module.exports = new BasketService();
