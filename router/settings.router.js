const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller.js');
const validateSchema = require('../middlewares/validateSchema.middleware.js');
const { updateSettingsSchema } = require('../schemas/settings.schema.js');

router.get('/', settingsController.getSettings);
router.patch('/', validateSchema(updateSettingsSchema),settingsController.updateSetting);

module.exports = router;