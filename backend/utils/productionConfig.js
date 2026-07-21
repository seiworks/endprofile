function requireProductionConfig() {
    if (process.env.NODE_ENV !== 'production') return;

    const required = ['MONGODB_URI', 'JWT_SECRET', 'REGISTRATION_INVITE_CODE', 'FRONTEND_ORIGIN'];
    const missing = required.filter((name) => !String(process.env[name] || '').trim());
    if (missing.length) {
        throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    }

    if (Buffer.byteLength(process.env.JWT_SECRET) < 32) {
        throw new Error('JWT_SECRET must contain at least 32 bytes in production');
    }
    if (Buffer.byteLength(process.env.REGISTRATION_INVITE_CODE) < 16) {
        throw new Error('REGISTRATION_INVITE_CODE must contain at least 16 bytes in production');
    }
    if (process.env.JWT_SECRET === process.env.REGISTRATION_INVITE_CODE) {
        throw new Error('JWT_SECRET and REGISTRATION_INVITE_CODE must be different');
    }

    const containsPlaceholder = process.env.MONGODB_URI.includes('USERNAME:PASSWORD@HOST')
        || process.env.JWT_SECRET.startsWith('GENERATE_')
        || process.env.REGISTRATION_INVITE_CODE.startsWith('GENERATE_')
        || process.env.FRONTEND_ORIGIN.includes('your-endprofile-domain');
    if (containsPlaceholder) {
        throw new Error('Replace all placeholder production environment values before starting');
    }

    const origins = process.env.FRONTEND_ORIGIN.split(',').map((value) => value.trim());
    if (origins.some((origin) => !origin.startsWith('https://') || origin.endsWith('/'))) {
        throw new Error('FRONTEND_ORIGIN must contain exact HTTPS origins without a trailing slash');
    }
}

module.exports = requireProductionConfig;
