const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { createCampaignSchema } = require('../schemas/campaign.schema');
const validateSchema = require('../middlewares/validateSchema.middleware');

router.get('/', campaignController.getCampaigns);
router.post('/', validateSchema(createCampaignSchema), campaignController.createCampaign);


module.exports = router;