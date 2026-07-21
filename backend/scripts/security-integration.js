const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');

process.env.JWT_SECRET = 'integration-test-secret-that-is-not-for-production';
process.env.REGISTRATION_INVITE_CODE = 'friends-only';
process.env.NODE_ENV = 'production';

const users = [];
class Query {
    constructor(value) { this.value = value; }
    select() { return this; }
    sort() { return this; }
    then(resolve, reject) { return Promise.resolve(this.value).then(resolve, reject); }
}
const FakeUser = {
    findOne(filter) { return new Query(users.find((user) => user.email === filter.email) || null); },
    findById(id) { return new Query(users.find((user) => user.id === String(id)) || null); },
    async updateOne(filter, update) {
        const user = users.find((item) => item.id === String(filter._id));
        if (user && update.$inc?.sessionVersion) user.sessionVersion = (user.sessionVersion || 0) + update.$inc.sessionVersion;
        if (user && update.$set) Object.assign(user, update.$set);
        return { matchedCount: user ? 1 : 0 };
    },
    async create(data) {
        const bcrypt = require('bcrypt');
        const user = {
            ...data,
            id: String(users.length + 1),
            sessionVersion: 0,
            async comparePassword(password) { return bcrypt.compare(password, this.passwordHash); },
            async save() { return this; },
        };
        users.push(user);
        return user;
    },
};

const userModelPath = path.resolve(__dirname, '../models/User.js');
require.cache[userModelPath] = { id: userModelPath, filename: userModelPath, loaded: true, exports: FakeUser };
const recoveryChallenges = [];
const FakeRecoveryChallenge = {
    async create(data) {
        recoveryChallenges.push({ ...data });
        return data;
    },
    async findOneAndDelete(filter) {
        const index = recoveryChallenges.findIndex((item) => item.challengeId === filter.challengeId
            && item.expiresAt > filter.expiresAt.$gt);
        if (index < 0) return null;
        return recoveryChallenges.splice(index, 1)[0];
    },
};
const recoveryModelPath = path.resolve(__dirname, '../models/RecoveryChallenge.js');
require.cache[recoveryModelPath] = {
    id: recoveryModelPath, filename: recoveryModelPath, loaded: true, exports: FakeRecoveryChallenge,
};
const authRoutes = require('../routes/auth');

const documents = [];
const FakeDocument = {
    find(filter) { return new Query(documents.filter((document) => document.userId === String(filter.userId))); },
    findOne(filter) {
        return new Query(documents.find((document) => document._id === String(filter._id)
            && document.userId === String(filter.userId)) || null);
    },
    async create(data) {
        const document = { ...data, _id: String(documents.length + 1), version: 1, updatedAt: new Date().toISOString() };
        documents.push(document);
        return document;
    },
    async findOneAndUpdate(filter, update) {
        const document = documents.find((item) => item._id === String(filter._id)
            && item.userId === String(filter.userId));
        if (!document) return null;
        Object.assign(document, update.$set);
        delete document.structuredData;
        delete document.draftText;
        document.version += 1;
        return document;
    },
};
const documentModelPath = path.resolve(__dirname, '../models/Document.js');
require.cache[documentModelPath] = { id: documentModelPath, filename: documentModelPath, loaded: true, exports: FakeDocument };
const documentRoutes = require('../routes/documents');

async function run() {
    const {
        createVault, decryptPayload, encryptPayload, recoverVault, signRecoveryChallenge,
    } = await import('../../frontend/src/services/vault.js');
    const vault = await createVault('correct horse battery staple');
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/documents', documentRoutes);
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api/auth`;
    const post = (route, body, cookieValue) => fetch(`${base}${route}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(cookieValue ? { cookie: cookieValue } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const api = (route, options = {}) => fetch(`http://127.0.0.1:${server.address().port}/api${route}`, options);
    try {
        let response = await post('/register', {
            email: 'blocked@example.com', name: 'Blocked', password: 'correct horse battery staple',
            inviteCode: 'incorrect', vaultMetadata: vault.metadata,
        });
        assert.equal(response.status, 403);

        response = await post('/register', {
            email: 'friend@example.com', name: 'Friend', password: 'correct horse battery staple',
            inviteCode: 'friends-only', vaultMetadata: vault.metadata,
        });
        assert.equal(response.status, 201);

        response = await post('/login', { email: 'friend@example.com', password: 'correct horse battery staple' });
        assert.equal(response.status, 200);
        const cookie = response.headers.get('set-cookie');
        assert.match(cookie, /^__Host-endprofile_session=/);
        assert.match(cookie, /HttpOnly/i);
        assert.match(cookie, /SameSite=Strict/i);
        assert.match(cookie, /Secure/i);
        assert.match(cookie, /Path=\//i);
        assert.ok(users[0].lastLoginAt instanceof Date);

        response = await post('/login', {
            email: 'friend@example.com', password: 'correct horse battery staple', rememberMe: true,
        });
        assert.equal(response.status, 200);
        assert.match(response.headers.get('set-cookie'), /Max-Age=604800/i);

        response = await api('/documents');
        assert.equal(response.status, 401);

        const wrongVault = await createVault('wrong recovery key password');
        response = await post('/recovery-challenge', { email: 'friend@example.com' });
        assert.equal(response.status, 200);
        let challenge = await response.json();
        const wrongSignature = await signRecoveryChallenge(wrongVault.recoveryKey, challenge.challenge);
        const attemptedMetadata = await recoverVault(vault.recoveryKey, 'a different strong password', challenge.vaultMetadata);
        response = await post('/reset-password', {
            challengeId: challenge.id, signature: wrongSignature,
            password: 'a different strong password', vaultMetadata: attemptedMetadata,
        });
        assert.equal(response.status, 401);

        response = await post('/recovery-challenge', { email: 'friend@example.com' });
        assert.equal(response.status, 200);
        challenge = await response.json();
        const metadata = await recoverVault(vault.recoveryKey, 'a different strong password', challenge.vaultMetadata);
        const signature = await signRecoveryChallenge(vault.recoveryKey, challenge.challenge);
        response = await post('/reset-password', {
            challengeId: challenge.id, signature, password: 'a different strong password', vaultMetadata: metadata,
        });
        assert.equal(response.status, 200);
        response = await api('/documents', { headers: { cookie: cookie.split(';')[0] } });
        assert.equal(response.status, 401);
        response = await post('/reset-password', {
            challengeId: challenge.id, signature, password: 'a different strong password', vaultMetadata: metadata,
        });
        assert.equal(response.status, 400);

        response = await post('/login', { email: 'friend@example.com', password: 'correct horse battery staple' });
        assert.equal(response.status, 401);
        response = await post('/login', { email: 'friend@example.com', password: 'a different strong password' });
        assert.equal(response.status, 200);
        const friendCookie = response.headers.get('set-cookie').split(';')[0];

        response = await api('/documents', {
            method: 'POST', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({ type: 'WILL', title: '預立遺囑', structuredData: { secret: true } }),
        });
        assert.equal(response.status, 400);

        const plaintextDraft = {
            structuredData: { testator: '私密姓名', note: '只能在瀏覽器解密' },
            draftText: '這是端對端加密文件測試',
        };
        const envelope = await encryptPayload(plaintextDraft);
        response = await api('/documents', {
            method: 'POST', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({ type: 'WILL', title: '預立遺囑', status: 'DRAFT', encryptedPayload: envelope }),
        });
        assert.equal(response.status, 201);
        const document = await response.json();
        assert.equal(document.structuredData, undefined);
        assert.equal(document.draftText, undefined);
        assert.notEqual(document.encryptedPayload.ciphertext, plaintextDraft.draftText);

        response = await api(`/documents/${document._id}`, { headers: { cookie: friendCookie } });
        assert.equal(response.status, 200);
        const encryptedDocument = await response.json();
        assert.deepEqual(await decryptPayload(encryptedDocument.encryptedPayload), plaintextDraft);

        response = await api('/documents', { headers: { cookie: friendCookie } });
        assert.equal(response.status, 200);
        const documentList = await response.json();
        assert.equal(documentList[0].structuredData, undefined);
        assert.equal(documentList[0].draftText, undefined);

        const secondVault = await createVault('another correct horse password');
        response = await post('/register', {
            email: 'other@example.com', name: 'Other', password: 'another correct horse password',
            inviteCode: 'friends-only', vaultMetadata: secondVault.metadata,
        });
        assert.equal(response.status, 201);
        response = await post('/login', { email: 'other@example.com', password: 'another correct horse password' });
        const otherCookie = response.headers.get('set-cookie').split(';')[0];
        response = await api(`/documents/${document._id}`, { headers: { cookie: otherCookie } });
        assert.equal(response.status, 404);
        response = await api(`/documents/${document._id}`, {
            method: 'PATCH', headers: { 'content-type': 'application/json', cookie: otherCookie },
            body: JSON.stringify({ encryptedPayload: envelope }),
        });
        assert.equal(response.status, 404);

        response = await post('/logout', undefined, friendCookie);
        assert.equal(response.status, 204);
        response = await api(`/documents/${document._id}`, { headers: { cookie: friendCookie } });
        assert.equal(response.status, 401);
        console.log('Security integration check passed');
    } finally {
        server.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
