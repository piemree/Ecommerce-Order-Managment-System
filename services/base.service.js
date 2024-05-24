
class BaseService {
    constructor() { }

    create = async (data) => {
        return this.model.create({ data });
    }

    findMany = async () => {
        return this.model.findMany();
    }

    findFirst = async (id) => {
        return this.model.findFirst({ where: { id } });
    }

    updateById = async (id, data) => {
        return this.model.update({ where: { id }, data });
    }
}

module.exports = BaseService;