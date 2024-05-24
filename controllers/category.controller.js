const categoryService = require('../services/category.service.js');

async function getCategories(req, res) {
    try {
        const categorys = await categoryService.findMany();
        res.json(categorys);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function createCategory(req, res) {
    try {
        const categoryData = {
            title: req.body?.title,
            description: req.body?.description
        }
        console.log(categoryData);
        const category = await categoryService.create(categoryData);
        res.json(category);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getCategories,
    createCategory
};