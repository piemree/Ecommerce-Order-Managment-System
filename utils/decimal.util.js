// create a function that takes a number and returns a number with 2 decimal places

const AppError = require("../errors/App.error")

function calc(number) {
    // check is number is a number
    if (isNaN(number)) throw AppError.InternalServerError()
    return parseFloat(number.toFixed(2))
}

module.exports = {
    calc
}