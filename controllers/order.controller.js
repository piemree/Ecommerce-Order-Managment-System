const orderService = require('../services/order.service.js');

async function getOrders(req, res, next) {
    try {
        const orders = await orderService.getOrders(req.user.id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
}

async function createOrder(req, res, next) {
    try {
        const { shippingAddress } = req.body;
        const order = await orderService.createOrder(req.user.id, shippingAddress);
        res.json(order);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getOrders,
    createOrder
};