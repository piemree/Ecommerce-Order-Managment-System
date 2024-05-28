const prisma = require('../prisma');
const BaseService = require('./base.service');
const AppError = require('../errors/app.error');

class CouponService extends BaseService {
    constructor() {
        super();
        this.model = prisma.coupon;
    }

    createCoupon = async (coupon) => {
        if (!this.isCouponCodeValid(coupon?.code)) throw new AppError("Invalid coupon code");

        return await this.model.create({
            data: coupon
        });
    }

    isCouponCodeValid = (couponCode) => {
        //Starts with TTN and then any number of digits or T's
        const regex = /^TTN[T\d]+$/;
        const isValid = regex.test(couponCode);
        const code = couponCode.slice(3);
        if (isNaN(parseInt(code[0]))) return false;
        if (isNaN(parseInt(code[code.length - 1]))) return false;
        if (!isValid) return false
        let codeArr = code.split("T");

        return codeArr?.every((num, index) => {
            const isNum = !isNaN(parseInt(num));
            if (!isNum) return true;
            const nextNumIndex = codeArr.findIndex((num, i) => i > index && !isNaN(parseInt(num)));
            return Math.abs(nextNumIndex - index) > 2
        });
    }

    getCoupons = async () => {
        return await this.model.findMany();
    }

    isCouponCodeAvailable = async (userId, couponCode) => {
        const coupon = await this.getCoupon(couponCode);
        if (!coupon) return false;
        if (!coupon.isActive) return false;
        if (coupon.usageCount > coupon.usageLimit) return false;

        const userCoupon = await prisma.coupon.findFirst({
            where: {
                User: {
                    some: {
                        id: userId
                    }
                },
                code: couponCode
            }
        });

        if (userCoupon) throw new AppError("Coupon already used");

        return coupon;

    }

    getCoupon = async (code) => {
        return this.model.findFirst({
            where: {
                code
            }
        });
    }

    findCouponById = async (couponId) => {
        return this.model.findFirst({
            where: {
                id: couponId
            }
        });
    }

    decrementUsage = async (couponId) => {
        const coupon = await this.findCouponById(couponId)
        if (coupon.usageCount <= 0) {
            return await this.model.update({
                where: {
                    id: couponId
                },
                data: {
                    usageCount: 0
                }
            })
        }
        return await this.model.update({
            where: {
                id: couponId
            },
            data: {
                usageCount: {
                    decrement: 1
                }
            }
        })
    }

    incrementUsage = async (couponId) => {
        await this.model.update({
            where: {
                id: couponId
            },
            data: {
                usageCount: {
                    increment: 1
                }
            }
        })
    }

}

module.exports = new CouponService();