const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');

router.get('/', campaignController.getCampaigns);
router.post('/', campaignController.createCampaign);


module.exports = router;