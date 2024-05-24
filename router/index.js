const express = require('express');
const authenticate = require('../middlewares/authenticate.middleware');
const router = express.Router();

router.use('/auth', require('./auth.router'));
router.use(authenticate);
router.use('/product', require('./product.router'));
router.use('/category', require('./category.router'));


module.exports = router;