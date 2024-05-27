const orderService = require('../services/order.service.js');

async function getOrders(req, res, next) {
    try {
        const orders = await orderService.getOrders(req.user.id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
}
async function getOrder(req, res, next) {
    try {
        const order = await orderService.getOrder(req.user?.id, req.params?.id);
        res.json(order);
    } catch (error) {
        next(error);
    }
}

async function createOrder(req, res, next) {
    try {
        const { shippingAddress } = req.body;
        const order = await orderService.createOrder(req.user, shippingAddress);
        res.json(order);
    } catch (error) {
        next(error);
    }
}

async function cancelOrder(req, res, next) {
    try {
        const order = await orderService.cancelOrder(req.user.id, req.params?.id);
        res.json(order);
    } catch (error) {
        next(error);
    }
}

async function updateItemQuantity(req, res, next) {
    try {
        const { itemId, quantity } = req.body;
        const order = await orderService.updateOrderItemQuantity(req.user.id, req.params?.id, itemId, quantity);
        res.json(order);

    } catch (error) {
        next(error);
    }
}

async function updateOrderStatus(req, res, next) {
    try {
        const order = await orderService.updateOrderStatus(req.user.id, req.params?.id, req.body.status);
        res.json(order);
    } catch (error) {
        next(error);
    }

}

module.exports = {
    getOrders,
    getOrder,
    updateItemQuantity,
    createOrder,
    cancelOrder,
    updateOrderStatus
};