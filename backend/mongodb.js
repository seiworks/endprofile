const mongoose = require('mongoose');

async function connectMongo() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/endprofile';
    await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
}

module.exports = connectMongo;
