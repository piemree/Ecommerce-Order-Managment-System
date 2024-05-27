const Redis = require("ioredis");

class CacheService {

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL);
    }

    async get(key) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
    }

    async set(key, value, duration = 60) {
        await this.redis.set(key, JSON.stringify(value), "EX", duration);
    }

    async del(key) {
        await this.redis.del(key);
    }
}

module.exports = new CacheService()