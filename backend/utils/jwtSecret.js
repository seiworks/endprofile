function getJwtSecret() {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }

    throw new Error('JWT_SECRET is required');
}

module.exports = getJwtSecret;
