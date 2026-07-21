const mongoose = require('mongoose');

const recoveryChallengeSchema = new mongoose.Schema({
    challengeId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    challenge: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('RecoveryChallenge', recoveryChallengeSchema);
