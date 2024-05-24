const productService = require('../services/product.service.js');

async function getProducts(req, res) {
    try {
        const products = await productService.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function createProduct(req, res) {
    try {
        const productData = {
            title: req.body?.title,
            category_id: req.body?.category_id,
            description: req.body?.description,
            price: req.body?.price,
            stock_quantity: req.body?.stock_quantity,
            origin: req.body?.origin,
            roast_level: req.body?.roast_level,
            flavor_notes: req.body?.flavor_notes
        }
        const product = await productService.create(productData);
        res.json(product);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getProducts,
    createProduct
};