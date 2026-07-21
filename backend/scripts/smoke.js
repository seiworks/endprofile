const assert = require('assert');

const mongoose = require('mongoose');
const getJwtSecret = require('../utils/jwtSecret');

require('../routes/auth');
require('../routes/user');
require('../routes/documents');
require('../routes/endprofile');
require('../routes/ai');
require('../routes/pdf');
require('../models/User');
require('../models/Document');
require('../models/EndProfile');
require('../models/Conversation');

assert.ok(mongoose.version.startsWith('8.'), `Expected Mongoose 8.x, got ${mongoose.version}`);

const originalNodeEnv = process.env.NODE_ENV;
const originalJwtSecret = process.env.JWT_SECRET;

delete process.env.JWT_SECRET;
process.env.NODE_ENV = 'production';

assert.throws(() => getJwtSecret(), /JWT_SECRET is required in production/);

process.env.NODE_ENV = originalNodeEnv;
if (originalJwtSecret) {
    process.env.JWT_SECRET = originalJwtSecret;
} else {
    delete process.env.JWT_SECRET;
}

console.log('Backend smoke check passed');

process.exit(0);
