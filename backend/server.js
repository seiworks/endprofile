const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectMongo = require('./mongodb');
const requireProductionConfig = require('./utils/productionConfig');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const endprofileRoutes = require('./routes/endprofile');
const documentsRoutes = require('./routes/documents');

requireProductionConfig();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
const allowedOrigins = String(process.env.FRONTEND_ORIGIN || 'http://localhost:5174')
    .split(',').map((value) => value.trim()).filter(Boolean);
const isDevelopmentOrigin = (origin) => process.env.NODE_ENV !== 'production'
    && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || isDevelopmentOrigin(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed'));
    },
    credentials: true,
}));
app.use(express.json({ limit: '256kb' }));

app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
}), authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/endprofile', endprofileRoutes);
app.use('/api/documents', documentsRoutes);

app.get('/api/health', (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'ok' : 'unavailable',
        database: databaseReady ? 'connected' : 'disconnected',
    });
});

if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(frontendDist, { index: false, maxAge: '1y', immutable: true }));
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api/')) {
            res.setHeader('Cache-Control', 'no-cache');
            return res.sendFile(path.join(frontendDist, 'index.html'));
        }
        return next();
    });
}

app.use((error, req, res, next) => {
    if (error && error.message === 'Origin not allowed') {
        return res.status(403).json({ message: '不允許的來源' });
    }
    console.error('Unhandled request error', error);
    return res.status(500).json({ message: '伺服器發生錯誤' });
});

const PORT = process.env.PORT || 4001;

async function start() {
    try {
        await connectMongo();
        app.listen(PORT, () => {
            console.log(`Backend server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Backend startup failed', error);
        process.exit(1);
    }
}

if (require.main === module) {
    start();
}

module.exports = { app, start };
