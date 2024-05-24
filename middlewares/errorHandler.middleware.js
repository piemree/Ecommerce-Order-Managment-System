function errorHandler(err, req, res, next) {
    // Hata mesajı ve istenilen HTTP durumu kodunu belirleyin
    const errorMessage = err.message || 'Bilinmeyen Hata';
    const statusCode = err.statusCode || 500;

    // Hata mesajını ve durum kodunu yanıt olarak gönderin
    res.status(statusCode)
        .json({
            error: {
                message: errorMessage,
                status: statusCode
            }
        });
}

module.exports = errorHandler;