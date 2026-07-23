const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');

process.env.JWT_SECRET = 'integration-test-secret-that-is-not-for-production';
process.env.REGISTRATION_INVITE_CODE = 'friends-only';
process.env.NODE_ENV = 'production';

const users = [];
class Query {
    constructor(value) { this.value = value; }
    select(expression) {
        if (Array.isArray(this.value) && typeof expression === 'string') {
            const excluded = expression.split(/\s+/).filter((field) => field.startsWith('-')).map((field) => field.slice(1));
            this.value = this.value.map((item) => {
                const copy = { ...item };
                excluded.forEach((field) => delete copy[field]);
                return copy;
            });
        }
        return this;
    }
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
    async findOneAndUpdate(filter, update, options = {}) {
        const document = documents.find((item) => item._id === String(filter._id)
            && item.userId === String(filter.userId));
        if (!document) return null;
        Object.assign(document, update.$set);
        if (update.$unset?.encryptedPayload) delete document.encryptedPayload;
        document.version += 1;
        if (options.timestamps !== false) document.updatedAt = new Date().toISOString();
        return document;
    },
};
const documentModelPath = path.resolve(__dirname, '../models/Document.js');
require.cache[documentModelPath] = { id: documentModelPath, filename: documentModelPath, loaded: true, exports: FakeDocument };
const documentRoutes = require('../routes/documents');

async function run() {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/documents', documentRoutes);
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const root = `http://127.0.0.1:${server.address().port}/api`;
    const post = (route, body, cookieValue) => fetch(`${root}/auth${route}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(cookieValue ? { cookie: cookieValue } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const api = (route, options = {}) => fetch(`${root}${route}`, options);
    try {
        let response = await post('/register', {
            email: 'blocked@example.com', name: 'Blocked', password: 'correct horse battery staple', inviteCode: 'incorrect',
        });
        assert.equal(response.status, 403);

        response = await post('/register', {
            email: 'friend@example.com', name: 'Friend', password: 'correct horse battery staple', inviteCode: 'friends-only',
        });
        assert.equal(response.status, 201);
        assert.equal(users[0].vaultMetadata, undefined);

        response = await post('/login', { email: 'friend@example.com', password: 'correct horse battery staple' });
        assert.equal(response.status, 200);
        const cookieHeader = response.headers.get('set-cookie');
        assert.match(cookieHeader, /^__Host-endprofile_session=/);
        assert.match(cookieHeader, /HttpOnly/i);
        assert.match(cookieHeader, /SameSite=Strict/i);
        assert.match(cookieHeader, /Secure/i);
        assert.match(cookieHeader, /Max-Age=604800/i);
        assert.ok(users[0].lastLoginAt instanceof Date);
        const oldCookie = cookieHeader.split(';')[0];

        response = await api('/documents');
        assert.equal(response.status, 401);

        response = await post('/reset-password', { email: 'missing@example.com', password: 'a different strong password' });
        assert.equal(response.status, 404);
        response = await post('/reset-password', { email: 'friend@example.com', password: 'short' });
        assert.equal(response.status, 400);
        response = await post('/reset-password', { email: 'friend@example.com', password: 'a different strong password' });
        assert.equal(response.status, 200);
        response = await api('/documents', { headers: { cookie: oldCookie } });
        assert.equal(response.status, 401);

        response = await post('/login', { email: 'friend@example.com', password: 'correct horse battery staple' });
        assert.equal(response.status, 401);
        response = await post('/login', { email: 'friend@example.com', password: 'a different strong password' });
        assert.equal(response.status, 200);
        const friendCookie = response.headers.get('set-cookie').split(';')[0];

        const legacyUpdatedAt = '2026-06-01T08:30:00.000Z';
        documents.push({
            _id: 'legacy', userId: '1', type: 'WILL', title: '舊密文', version: 1,
            encryptedPayload: { version: 1, algorithm: 'AES-256-GCM', iv: 'AA==', ciphertext: 'AA==' },
            updatedAt: legacyUpdatedAt,
        });
        response = await api('/documents/legacy/migrate', {
            method: 'POST', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({ structuredData: { migrated: true }, draftText: '轉換後明文' }),
        });
        assert.equal(response.status, 200);
        const migrated = await response.json();
        assert.equal(migrated.updatedAt, legacyUpdatedAt);
        assert.equal(migrated.encryptedPayload, undefined);
        response = await api('/documents/legacy/migrate', {
            method: 'POST', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({ structuredData: { migrated: true }, draftText: '重複轉換' }),
        });
        assert.equal(response.status, 409);

        response = await api('/documents', {
            method: 'POST', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({ type: 'WILL', title: '預立遺囑', structuredData: { testator: '私密姓名' } }),
        });
        assert.equal(response.status, 400);

        response = await api('/documents', {
            method: 'POST', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({
                type: 'WILL', title: '預立遺囑', status: 'DRAFT',
                structuredData: { testator: '私密姓名' }, draftText: '這是明文文件測試',
            }),
        });
        assert.equal(response.status, 201);
        const document = await response.json();
        assert.deepEqual(document.structuredData, { testator: '私密姓名' });
        assert.equal(document.draftText, '這是明文文件測試');
        assert.equal(document.encryptedPayload, null);

        response = await api('/documents', { headers: { cookie: friendCookie } });
        assert.equal(response.status, 200);
        const documentList = await response.json();
        assert.equal(documentList[0].structuredData, undefined);
        assert.equal(documentList[0].draftText, undefined);
        assert.equal(documentList[0].encryptedPayload, undefined);

        response = await api(`/documents/${document._id}`, {
            method: 'PATCH', headers: { 'content-type': 'application/json', cookie: friendCookie },
            body: JSON.stringify({ structuredData: { testator: '更新姓名' }, draftText: '更新後全文' }),
        });
        assert.equal(response.status, 200);
        const updated = await response.json();
        assert.deepEqual(updated.structuredData, { testator: '更新姓名' });
        assert.equal(updated.draftText, '更新後全文');

        response = await post('/register', {
            email: 'other@example.com', name: 'Other', password: 'another correct horse password', inviteCode: 'friends-only',
        });
        assert.equal(response.status, 201);
        response = await post('/login', { email: 'other@example.com', password: 'another correct horse password' });
        const otherCookie = response.headers.get('set-cookie').split(';')[0];
        response = await api(`/documents/${document._id}`, { headers: { cookie: otherCookie } });
        assert.equal(response.status, 404);
        response = await api(`/documents/${document._id}`, {
            method: 'PATCH', headers: { 'content-type': 'application/json', cookie: otherCookie },
            body: JSON.stringify({ draftText: '越權修改' }),
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
