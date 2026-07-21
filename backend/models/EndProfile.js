const mongoose = require('mongoose');

const endProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallStatus: {
      type: String,
      enum: ['DRAFT', 'COMPLETED_PARTIAL', 'COMPLETED'],
      default: 'DRAFT',
    },
    willStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    cohabitationStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    guardianshipStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    lifeAuthorizationStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    jointPurchaseStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    preferences: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const EndProfile = mongoose.model('EndProfile', endProfileSchema);

module.exports = EndProfile;
