const prisma = require('../prisma');
const BaseService = require('./base.service');
const productService = require('./product.service');
const campaignService = require('./campaign.service');

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
        const basketPromise = this.findFirst({
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
                    subtotal: {
                        increment: quantity * product.price
                    },
                    total: {
                        increment: quantity * product.price
                    }
                },
                include: {
                    items: true
                }
            });
            return await this.applyOrCancelCampaign(userId);
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
                subtotal: {
                    increment: quantity * product.price
                },
                total: {
                    increment: quantity * product.price
                }
            },
            include: {
                items: true
            }
        });
        return await this.applyOrCancelCampaign(userId);

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
                campaignDiscount: 0,
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

        if (!basketItem) return basket;

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
                subtotal: {
                    decrement: basketItem.product.price * basketItem.quantity
                },
                total: {
                    decrement: basketItem.product.price * basketItem.quantity
                }
            },
            include: {
                items: true
            }
        });

        return await this.applyOrCancelCampaign(userId);
    }

    updateItemQuantity = async (userId, productId, quantity) => {
        const basket = await this.model.findFirst({
            where: {
                userId
            },
            include: {
                items: true
            }
        });

        if (!basket) return false;

        const item = basket.items.find(item => item.productId === productId);

        if (!item) return basket;

        if (quantity <= 0) {
            return await this.model.update({
                where: {
                    id: basket.id
                },
                data: {
                    items: {
                        deleteMany: {
                            productId
                        }
                    }
                },
                include: {
                    items: true
                }
            });
        }

        return await this.model.update({
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
                    totalDiscount: {
                        decrement: basket.campaignDiscount
                    },
                    total: {
                        increment: basket.campaignDiscount
                    }
                },
                include: {
                    items: true,
                    Campaign: true
                }
            });
        }

        if (basket.Campaign && basket.Campaign.id === campaign.id) return basket;

        const campaignDiscount = basket.subtotal * campaign.discountPct / 100;

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
                campaignDiscount: campaignDiscount,
                totalDiscount: basket.couponDiscount + campaignDiscount,
                total: {
                    decrement: campaignDiscount
                }
            },
            include: {
                items: true,
                Campaign: true
            }
        });

        return newBasket;

    }
}

module.exports = new BasketService();
