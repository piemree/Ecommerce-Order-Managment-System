const basketService = require('../services/basket.service.js');
const AppError = require('../errors/app.error.js');
const { isProductStockAvailable } = require('../services/product.service.js');

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
        const isStockAvailable = await isProductStockAvailable(productId, quantity);
        if (!isStockAvailable) return next(AppError.StockNotAvailable());

        const basket = await basketService.addItem(req.user.id, productId, quantity);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

async function removeItem(req, res, next) {
    try {
        const { basketItemId } = req.body;
        const basket = await basketService.removeItem(req.user.id, basketItemId);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

async function updateItemQuantity(req, res, next) {
    try {
        const { basketItemId, quantity } = req.body;
        const basket = await basketService.updateItemQuantity(req.user.id, basketItemId, quantity);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

async function applyCoupon(req, res, next) {
    try {
        const { couponCode } = req.body;
        const basket = await basketService.applyCoupon(req.user.id, couponCode);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}

async function cancelCurrentCoupon(req, res, next) {
    try {
        const basket = await basketService.cancelCurrentCoupon(req.user.id);
        res.json(basket);
    } catch (error) {
        next(error);
    }
}




module.exports = {
    getBasket,
    addItem,
    removeItem,
    updateItemQuantity,
    applyCoupon,
    cancelCurrentCoupon
};