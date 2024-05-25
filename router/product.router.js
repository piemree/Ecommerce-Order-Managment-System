const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.patch('/update-stock', productController.updateProductStock);


module.exports = router;