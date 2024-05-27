const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');
const validateSchema = require('../middlewares/validateSchema.middleware.js');
const { createOrderSchema, updateOrderQuantitySchema, updateOrderStatusSchema } = require('../schemas/order.schema.js');

router.post('/', validateSchema(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/updateItemQuantity', validateSchema(updateOrderQuantitySchema), orderController.updateItemQuantity);
router.patch('/:id/updateStatus', validateSchema(updateOrderStatusSchema), orderController.updateOrderStatus);


module.exports = router;