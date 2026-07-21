const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        locale: {
            type: String,
            default: 'zh-TW',
        },
    },
    { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

