const jwt = require('jsonwebtoken');
const getJwtSecret = require('../utils/jwtSecret');
const sendError = require('../utils/httpError');

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return sendError(res, 401, 'Invalid token');
    }
}

module.exports = auth;
