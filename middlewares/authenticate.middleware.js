const { verifyUser } = require("../services/auth.service");

function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).send("Unauthorized");
    }
    try {
        console.log("token",token);
        const user = verifyUser(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send("Unauthorized");
    }
}

module.exports = authenticate;