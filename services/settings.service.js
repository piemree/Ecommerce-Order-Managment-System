const prisma = require('../prisma');

class SettingsService {

    constructor() { }

    async createSetting(data) {
        const settings = await prisma.settings.findUnique({
            where: { id: 1 }
        });
        if (settings) return settings;
        return await prisma.settings.create({ data });
    }

    async getSettings() {
        return await prisma.settings.findUnique({
            where: { id: 1 }
        })
    }


    async updateSettings(data) {
        return await prisma.settings.update({
            where: { id: 1 },
            data
        });
    }

}

module.exports = new SettingsService();