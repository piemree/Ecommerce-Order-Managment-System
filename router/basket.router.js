const express = require('express');
const router = express.Router();
const basketController = require('../controllers/basket.controller.js');

router.get('/', basketController.getBasket);
router.patch('/addItem', basketController.addItem);
router.patch('/removeItem', basketController.removeItem);
router.patch('/updateItemQuantity', basketController.updateItemQuantity);
router.patch('/applyCoupon', basketController.applyCoupon);


module.exports = router;