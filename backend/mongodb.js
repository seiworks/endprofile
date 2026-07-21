const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

function connectMongo() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/endprofile';

    mongoose
        .connect(uri, {
            autoIndex: true,
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

