const prisma = require('../prisma');
const BaseService = require('./base.service');

class CategoryService extends BaseService {
    constructor() {
        super();
        this.model = prisma.category;
    }

}

module.exports = new CategoryService();
