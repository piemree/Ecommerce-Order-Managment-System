const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const validateSchema = require('../middlewares/validateSchema.middleware');
const { createCategorySchema } = require('../schemas/category.schema');

router.get('/', categoryController.getCategories);
router.post('/', validateSchema(createCategorySchema), categoryController.createCategory);


module.exports = router;