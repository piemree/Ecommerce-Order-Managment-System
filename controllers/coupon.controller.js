const cuponService = require('../services/coupon.service');

async function createCoupon(req, res, next) {
    try {
        const couponData = {
            code: req.body?.code,
            isActive: req.body?.isActive,
            isPercent: req.body?.isPercent,
            discountPct: req.body?.discountPct,
            discount: req.body?.discount,
            usageLimit: req.body?.usageLimit,
            usageCount: req.body?.usageCount,
        }
        const coupon = await cuponService.createCoupon(couponData);
        res.status(201).send(coupon);
    } catch (error) {
        next(error);
    }
}

async function getCoupons(req, res, next) {
    try {
        const coupons = await cuponService.getCoupons();
        res.status(200).send(coupons);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCoupon,
    getCoupons
}