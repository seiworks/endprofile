const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');
const sendError = require('../utils/httpError');

async function auth(req, res, next) {
    const cookies = Object.fromEntries(
        String(req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
            const [key, ...value] = part.trim().split('=');
            return [key, decodeURIComponent(value.join('='))];
        })
    );
    const token = cookies['__Host-endprofile_session'] || cookies.endprofile_session;
    if (!token) {
        return sendError(res, 401, 'Unauthorized');
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findById(decoded.id).select('+sessionVersion');
        const currentVersion = Number(user && user.sessionVersion) || 0;
        if (!user || decoded.sv !== currentVersion) {
            return sendError(res, 401, 'Session expired');
        }
        req.user = { id: decoded.id, sessionVersion: currentVersion };
        next();
    } catch (err) {
        return sendError(res, 401, 'Invalid token');
    }
}

module.exports = auth;
