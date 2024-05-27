const productService = require('../services/product.service.js');

async function getProducts(req, res, next) {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
}


async function createProduct(req, res, next) {
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
        next(error);
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
    updateProductStock,
    
};