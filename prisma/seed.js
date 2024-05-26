// seed prisma databse
const prisma = require('./index');
const userSeed = require('./seeds/user.seed.json');
const categorySeed = require('./seeds/category.seed.json');
const productSeed = require('./seeds/product.seed.json');
const settingsSeed = require('./seeds/settings.seed.json');
const campaignSeed = require('./seeds/campaign.seed.json');
const couponSeed = require('./seeds/coupon.seed.json');



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
        await transaction()
        await prisma.$disconnect()
    } catch (e) {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }
}

seed()


