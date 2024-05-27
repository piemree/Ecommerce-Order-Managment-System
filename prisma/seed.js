// seed prisma databse
const prisma = require('./index');
const userSeed = require('./seeds/user.seed.json');
const categorySeed = require('./seeds/category.seed.json');
const productSeed = require('./seeds/product.seed.json');
const settingsSeed = require('./seeds/settings.seed.json');
const campaignSeed = require('./seeds/campaign.seed.json');
const couponSeed = require('./seeds/coupon.seed.json');

async function isDbEmpty() {
    const [users, categories, products, settings, campaigns, coupons] = await Promise.all([
        prisma.user.findMany(),
        prisma.category.findMany(),
        prisma.product.findMany(),
        prisma.settings.findMany(),
        prisma.campaign.findMany(),
        prisma.coupon.findMany()
    ])
    return users.length === 0 && categories.length === 0 && products.length === 0 && settings.length === 0 && campaigns.length === 0 && coupons.length === 0

}

async function transaction() {


    const settings = await prisma.settings.create({
        data: settingsSeed
    })

    //user pass 123456
    const user = await prisma.user.create({
        data: userSeed
    })

    const coupon = await prisma.coupon.create({
        data: couponSeed
    })

    const category = await prisma.category.create({
        data: categorySeed,
    })


    const productPromises = productSeed.map(async (product) => {
        return prisma.product.create({
            data: {
                ...product,
                category: { connect: { id: category.id } }
            }
        })
    })

    const products = await Promise.all(productPromises)

    const campaignPromises = campaignSeed.map(async (campaign, i) => {
        return prisma.campaign.create({
            data: {
                ...campaign,
                ...(i === campaignSeed.length - 1 && { giftProduct: { connect: { id: products[0].id } } }),
            }
        })
    })

    await Promise.all(campaignPromises)

    console.log('Seed completed')






}

async function seed() {
    try {
        const empty = await isDbEmpty()
        if (!empty) {
            console.log('Database is not empty, skipping seed')
            console.log("if you want to delete all data and seed again, run 'npx prisma db seed --force'");
            return
        }
        await transaction()
        await prisma.$disconnect()
    } catch (e) {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }
}

seed()


