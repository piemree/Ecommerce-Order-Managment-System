const pe = require('pretty-error').start();
const removeLineBreaks = require('../utils/removeLineBreaks.util.js');


function errorHandler(err, req, res, next) {
    // Hata mesajı ve istenilen HTTP durumu kodunu belirleyin
    const errorMessage = err.message || 'Bilinmeyen Hata';
    const statusCode = err.statusCode || 500;
    console.log(pe.render(err));
    // Hata mesajını ve durum kodunu yanıt olarak gönderin
    res.status(statusCode)
        .json({
            error: {
                message: removeLineBreaks(errorMessage),
                status: statusCode
            }
        });
}

module.exports = errorHandler;