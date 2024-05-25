const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');

router.post('/', couponController.createCoupon);
router.get('/', couponController.getCoupons);

module.exports = router;