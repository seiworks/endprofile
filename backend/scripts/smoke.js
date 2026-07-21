const assert = require('assert');

const mongoose = require('mongoose');
const getJwtSecret = require('../utils/jwtSecret');
const normalizeVaultMetadata = require('../utils/vaultMetadata');

require('../routes/auth');
require('../routes/user');
require('../routes/documents');
require('../routes/endprofile');
require('../routes/ai');
require('../models/User');
require('../models/Document');
require('../models/EndProfile');
require('../models/Conversation');

assert.ok(mongoose.version.startsWith('8.'), `Expected Mongoose 8.x, got ${mongoose.version}`);

const originalNodeEnv = process.env.NODE_ENV;
const originalJwtSecret = process.env.JWT_SECRET;

delete process.env.JWT_SECRET;
process.env.NODE_ENV = 'production';

assert.throws(() => getJwtSecret(), /JWT_SECRET is required/);

const wrap = { ciphertext: 'QUJDRA==', iv: 'QUJDRA==', salt: 'QUJDRA==' };
assert.ok(normalizeVaultMetadata({
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iterations: 600000,
    passwordWrap: wrap,
    recoveryWrap: wrap,
    recoveryPublicKey: 'QUJDRA==',
}));
assert.strictEqual(normalizeVaultMetadata({ version: 1 }), null);

process.env.NODE_ENV = originalNodeEnv;
if (originalJwtSecret) {
    process.env.JWT_SECRET = originalJwtSecret;
} else {
    delete process.env.JWT_SECRET;
}

console.log('Backend smoke check passed');

process.exit(0);
