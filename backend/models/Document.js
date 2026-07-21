const mongoose = require('mongoose');
const { DOCUMENT_TYPE_VALUES, DOCUMENT_STATUS_VALUES, DOCUMENT_STATUSES } = require('../constants/documentTypes');

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
            enum: DOCUMENT_TYPE_VALUES,
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
            enum: DOCUMENT_STATUS_VALUES,
            default: DOCUMENT_STATUSES.DRAFT,
        },
    },
    { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
