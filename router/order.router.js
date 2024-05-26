const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/updateItemQuantity', orderController.updateItemQuantity);
router.patch('/:id/updateStatus', orderController.updateOrderStatus);


module.exports = router;