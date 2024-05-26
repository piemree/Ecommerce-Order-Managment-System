const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);


module.exports = router;