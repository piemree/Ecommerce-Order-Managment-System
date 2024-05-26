const express = require('express');
const authenticate = require('../middlewares/authenticate.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger-output.json');
const router = express.Router();




router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));
router.use('/auth', require('./auth.router'));
router.use(authenticate);
router.use('/product', require('./product.router'));
router.use('/basket', require('./basket.router'));
router.use('/category', require('./category.router'));
router.use('/campaign', require('./campaign.router'));
router.use('/settings', require('./settings.router'));
router.use('/coupon', require('./coupon.router'));
router.use('/order', require('./order.router'));


module.exports = router;