const jwt = require('jsonwebtoken');

 const fetchuser = function(req, res, next) {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access Denied');
    }
    try {
        const verified = jwt.verify(token, "mySecretKey123");
        req.user = verified.user;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
 };

 module.exports = fetchuser;