const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectMongo = require('./mongodb');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const endprofileRoutes = require('./routes/endprofile');
const documentsRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');
const pdfRoutes = require('./routes/pdf');

const app = express();

app.use(cors());
app.use(express.json());

connectMongo();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/endprofile', endprofileRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
