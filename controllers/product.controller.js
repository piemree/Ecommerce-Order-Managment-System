const { category } = require('../prisma/index.js');
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
            categoryId: req.body?.categoryId,
            description: req.body?.description,
            price: req.body?.price,
            stockQuantity: req.body?.stockQuantity,
            origin: req.body?.origin,
            roastLevel: req.body?.roastLevel,
            flavorNotes: req.body?.flavorNotes
        }
        delete productData.categoryId;
        const product = await productService.createProduct(productData, req.body?.categoryId);
        res.json(product);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function updateProductStock(req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const product = await productService.updateProductStock(productId, quantity);
        res.json(product);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProducts,
    createProduct,
    updateProductStock
};