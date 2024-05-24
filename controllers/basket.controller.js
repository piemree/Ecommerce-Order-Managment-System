const prisma = require('../prisma/index.js');
const basketService = require('../services/basket.service.js');

async function getBasket(req, res, next) {
    try {
      const basket = await basketService.getBasket(req.user.id);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

async function addItem(req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const basket = await basketService.addItem(req.user.id, productId, quantity);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

async function removeItem(req, res, next) {
    try {
        const { productId } = req.body;
        const basket = await basketService.removeItem(req.user.id, productId);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getBasket,
    addItem,
    removeItem
};