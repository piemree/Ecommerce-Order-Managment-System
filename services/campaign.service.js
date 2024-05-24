const prisma = require('../prisma');
const BaseService = require('./base.service');

class CampaignService extends BaseService {
    constructor() {
        super();
        this.model = prisma.campaign;
    }
}

module.exports = new CampaignService();
