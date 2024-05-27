const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const validateSchema = require('../middlewares/validateSchema.middleware');
const { createCouponSchema } = require('../schemas/coupon.schema');

router.post('/', validateSchema(createCouponSchema),couponController.createCoupon);
router.get('/', couponController.getCoupons);

module.exports = router;