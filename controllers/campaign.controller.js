const campaignService = require('../services/campaign.service.js');

async function getCampaigns(req, res, next) {
    try {
        const campaigns = await campaignService.getCampaigns();
        res.json(campaigns);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function createCampaign(req, res, next) {
    try {
        const campaignData = {
            name: req.body?.name,
            discountPct: req.body?.discountPct,
            minAmount: req.body?.minAmount,
            giftProductId: req.body?.giftProductId
        }
        const campaign = await campaignService.createCampaign(campaignData);
        res.json(campaign);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCampaigns,
    createCampaign
};