const orderService = require('../services/order.service.js');

async function getOrders(req, res) {
    try {
        const orders = await orderService.findMany();
        res.json(orders);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function createOrder(req, res) {
    try {
        const total = req.body.orderItems.reduce((acc, item) => acc + item.price, 0);
        const orderData = {
        
           orderItems: req.body.orderItems,
        }
        const order = await orderService.create(orderData);
        res.json(order);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getOrders,
    createOrder
};