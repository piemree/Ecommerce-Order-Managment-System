const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const validateSchema = require('../middlewares/validateSchema.middleware');
const { createProductSchema, updateProductStockSchema } = require('../schemas/product.schema');

router.get('/', productController.getProducts);
router.post('/', validateSchema(createProductSchema), productController.createProduct);
router.patch('/updateStock', validateSchema(updateProductStockSchema), productController.updateProductStock);


module.exports = router;