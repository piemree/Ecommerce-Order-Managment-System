class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    static Unauthorized() {
        return new AppError("Unauthorized", 401);
    }

    static Forbidden() {
        return new AppError("Forbidden", 403);
    }

    static NotFound() {
        return new AppError("Not Found", 404);
    }

    static BadRequest() {
        return new AppError("Bad Request", 400);
    }

    static InternalServerError() {
        return new AppError("Internal Server Error", 500);
    }

}


module.exports = AppError;