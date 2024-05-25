const categoryService = require('../services/category.service.js');

async function getCategories(req, res, next) {
    try {
        const categorys = await categoryService.findMany();
        res.json(categorys);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function createCategory(req, res, next) {
    try {
        const categoryData = {
            title: req.body?.title,
            description: req.body?.description
        }
        const category = await categoryService.create({ data: categoryData });
        res.json(category);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCategories,
    createCategory
};