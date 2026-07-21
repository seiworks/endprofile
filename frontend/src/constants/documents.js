export const DOCUMENTS = Object.freeze([
    {
        key: 'will',
        type: 'WILL',
        title: '預立遺囑',
        draftTitle: '預立遺囑',
        navTitle: '預立遺囑',
        route: '/endprofile/will',
        description: '整理財產與想照顧的人，生成遺囑草稿。',
    },
    {
        key: 'cohabitation',
        type: 'COHABITATION',
        title: '授權書／同居協議',
        draftTitle: '授權書與同居協議',
        navTitle: '同居協議',
        route: '/endprofile/cohabitation',
        description: '約定生活費、房產使用權與其它相關重要授權。',
    },
    {
        key: 'jointPurchase',
        type: 'JOINT_PURCHASE',
        title: '共同購屋協議',
        draftTitle: '共同購屋協議',
        navTitle: '共同購屋協議',
        route: '/endprofile/joint-purchase',
        description: '釐清共同出資買房時的持分、貸款與出場機制。',
    },
    {
        key: 'lifeAuthorization',
        type: 'LIFE_AUTHORIZATION',
        title: '生活授權',
        draftTitle: '生活授權書',
        navTitle: '生活授權',
        route: '/endprofile/life-authorization',
        description: '預先授權信任的人，在你不方便時協助處理帳戶與生活支出。',
    },
    {
        key: 'guardianship',
        type: 'GUARDIANSHIP',
        title: '意定監護契約',
        draftTitle: '意定監護契約',
        navTitle: '意定監護',
        route: '/endprofile/guardianship',
        description: '指定最信任的人，在你失能時替你作決定。',
    },
]);

export const DOCUMENT_BY_TYPE = Object.freeze(
    DOCUMENTS.reduce((acc, document) => {
        acc[document.type] = document;
        return acc;
    }, {})
);

export const DOCUMENT_BY_KEY = Object.freeze(
    DOCUMENTS.reduce((acc, document) => {
        acc[document.key] = document;
        return acc;
    }, {})
);
