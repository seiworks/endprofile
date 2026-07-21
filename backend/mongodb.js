const mongoose = require('mongoose');

function connectMongo() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/endprofile';

    mongoose
        .connect(uri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        })
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((err) => {
            console.error('MongoDB connection error', err);
            process.exit(1);
        });
}

module.exports = connectMongo;
