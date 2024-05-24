
class BaseService {
    constructor() { }

    create = async (data) => {
        return this.model.create(data );
    }

    findMany = async () => {
        return this.model.findMany();
    }

    findFirst = async (query) => {
        return this.model.findFirst(query);
    }

    updateById = async (id, data) => {
        return this.model.update({ where: { id }, data });
    }
}

module.exports = BaseService;