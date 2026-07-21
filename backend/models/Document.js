const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['WILL', 'COHABITATION', 'GUARDIANSHIP', 'LIFE_AUTHORIZATION', 'JOINT_PURCHASE'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        structuredData: {
            type: Object,
            default: {},
        },
        draftText: {
            type: String,
            default: '',
        },
        version: {
            type: Number,
            default: 1,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'REVIEWED', 'SIGNED'],
            default: 'DRAFT',
        },
    },
    { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
