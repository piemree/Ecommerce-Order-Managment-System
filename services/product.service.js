const prisma = require('../prisma');
const BaseService = require('./base.service');

class ProductService extends BaseService {
    constructor() {
        super();
        this.model = prisma.order;
    }
}

module.exports = new ProductService();
