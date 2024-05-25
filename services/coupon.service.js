const prisma = require('../prisma');
const BaseService = require('./base.service');

class CouponService extends BaseService {
    constructor() {
        super();
        this.model = prisma.coupon;
    }

    createCoupon = async (coupon) => {
        return await this.model.create({
            data: coupon
        });
    }

    validateCoupon = async (couponCode) => {}

    getCoupons = async () => {
        return await this.model.findMany();
    }
}

module.exports = new CouponService();