const prisma = require('../prisma');
const BaseService = require('./base.service');

class CampaignService extends BaseService {
    constructor() {
        super();
        this.model = prisma.campaign;
    }

    async getCampaigns() {
        return this.model.findMany();
    }

    async getCampaignById(id) {
        return this.model.findUnique({ where: { id } });
    }

    async createCampaign(data) {
        return this.model.create({ data });
    }

    getSuitableCampaign = async (basketTotal) => {
        const allCampaigns = await this.getCampaigns();

        // sorst campaigns by discount big to small
        const sortedCampaigns = allCampaigns.sort((a, b) => b.discountPct - a.discountPct);
        const suitableCampaign = sortedCampaigns.find(campaign => basketTotal >= campaign.minAmount);
        return suitableCampaign;

    }
}

module.exports = new CampaignService();
