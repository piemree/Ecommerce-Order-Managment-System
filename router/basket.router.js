const express = require('express');
const router = express.Router();
const basketController = require('../controllers/basket.controller.js');

router.get('/', basketController.getBasket);
router.patch('/add-item', basketController.addItem);
router.patch('/remove-item', basketController.removeItem);
router.patch('/update-item-quantity', basketController.updateItemQuantity);


module.exports = router;