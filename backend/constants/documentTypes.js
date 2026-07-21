const DOCUMENT_TYPES = Object.freeze({
    WILL: 'WILL',
    COHABITATION: 'COHABITATION',
    GUARDIANSHIP: 'GUARDIANSHIP',
    LIFE_AUTHORIZATION: 'LIFE_AUTHORIZATION',
    JOINT_PURCHASE: 'JOINT_PURCHASE',
});

const DOCUMENT_TYPE_VALUES = Object.freeze(Object.values(DOCUMENT_TYPES));

const DOCUMENT_STATUSES = Object.freeze({
    DRAFT: 'DRAFT',
    REVIEWED: 'REVIEWED',
    SIGNED: 'SIGNED',
});

const DOCUMENT_STATUS_VALUES = Object.freeze(Object.values(DOCUMENT_STATUSES));

const DOCUMENT_TYPE_CONFIG = Object.freeze({
    will: {
        type: DOCUMENT_TYPES.WILL,
        title: '預立遺囑',
    },
    cohabitation: {
        type: DOCUMENT_TYPES.COHABITATION,
        title: '授權書／同居協議',
    },
    guardianship: {
        type: DOCUMENT_TYPES.GUARDIANSHIP,
        title: '意定監護契約',
    },
    'joint-purchase': {
        type: DOCUMENT_TYPES.JOINT_PURCHASE,
        title: '共同購屋協議',
    },
    'life-authorization': {
        type: DOCUMENT_TYPES.LIFE_AUTHORIZATION,
        title: '生活授權',
    },
});

module.exports = {
    DOCUMENT_TYPES,
    DOCUMENT_TYPE_VALUES,
    DOCUMENT_STATUSES,
    DOCUMENT_STATUS_VALUES,
    DOCUMENT_TYPE_CONFIG,
};
