const express = require('express');
const router = express.Router();
const basketController = require('../controllers/basket.controller.js');
const { addItemToBasketSchema, removeItemFromBasketSchema, updateBasketItemQuantitySchema, applyCouponToBasketSchema } = require('../schemas/basket.schema.js');
const validateSchema = require('../middlewares/validateSchema.middleware.js');

router.get('/', basketController.getBasket);
router.patch('/addItem', validateSchema(addItemToBasketSchema), basketController.addItem);
router.patch('/removeItem', validateSchema(removeItemFromBasketSchema), basketController.removeItem);
router.patch('/updateItemQuantity', validateSchema(updateBasketItemQuantitySchema), basketController.updateItemQuantity);
router.patch('/applyCoupon', validateSchema(applyCouponToBasketSchema), basketController.applyCoupon);
router.patch('/cancelCurrentCoupon', basketController.cancelCurrentCoupon);


module.exports = router;