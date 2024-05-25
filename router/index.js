const express = require('express');
const authenticate = require('../middlewares/authenticate.middleware');
const router = express.Router();

router.use('/auth', require('./auth.router'));
router.use(authenticate);
router.use('/product', require('./product.router'));
router.use('/basket', require('./basket.router'));
router.use('/category', require('./category.router'));
router.use('/campaign', require('./campaign.router'));


module.exports = router;