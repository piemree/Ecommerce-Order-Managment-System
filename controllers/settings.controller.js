const SettingsService = require('../services/settings.service');



async function getSettings(req, res, next) {
    try {
        const settings = await SettingsService.getSettings();
        res.json(settings);
    } catch (error) {
        next(error);
    }
}


async function updateSetting(req, res, next) {
    try {
        const settingsData = {
            cargoPrice: req.body?.cargoPrice,
            minAmountForFreeCargo: req.body?.minAmountForFreeCargo,
        }
        const settings = await SettingsService.updateSettings(settingsData);
        res.json(settings);
    } catch (error) {
        next(error);
    }
}




module.exports = {
    getSettings,
    updateSetting,
}