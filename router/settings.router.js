const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller.js');

router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSetting);

module.exports = router;