const prisma = require('../prisma');
const BaseService = require('./base.service');

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
                }
            }
        });
        if (!basket) {
            const basket = await this.create({
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
                    }
                }
            });
            return res.json(basket);
        }
        return basket;
    }

    addItem = async (userId, productId, quantity) => {
        const basket = await this.findFirst({
            where: {
                userId
            },
            include: {
                items: true
            }
        });

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
                                quantity: {
                                    increment: quantity ? quantity : 1
                                }
                            }
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
                    create: {
                        productId,
                        quantity: quantity ? quantity : 1
                    }
                }
            },
            include: {
                items: true
            }
        });

    }

    removeItem = async (userId, productId) => {
        const basket = await this.findFirst({
            where: {
                userId
            }
        });

        if (!basket) {
            return false;
        }

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
            }
        });
    }

    updateItemQuantity = async (userId, productId, quantity) => {
        const basket = await this.findFirst({
            where: {
                userId
            },
            include: {
                items: true
            }
        });

        if (!basket) return false;

        const item = basket.items.find(item => item.productId === productId);

        if (!item) return false;

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
                }
            }
        });
    }
}

module.exports = new BasketService();
