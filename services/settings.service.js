const prisma = require('../prisma');

class SettingsService {

    constructor() { }

    async getAllSettings() {
        return await prisma.settings.findMany();
    }

    async getSetting(key) {
        return await prisma.settings.findFirst({
            where: {
                key: key
            }
        });
    }

    async setSetting(key, value) {
        await prisma.settings.update({
            where: {
                key: key
            },
            data: {
                value: value
            }
        });
    }
}

module.exports = new SettingsService();