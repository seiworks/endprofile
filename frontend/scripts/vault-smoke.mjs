import assert from 'node:assert/strict';
import { decryptPayload, unlockVault } from '../src/services/vault.js';

const encoder = new TextEncoder();
const toBase64 = (value) => Buffer.from(value).toString('base64');
const password = 'correct horse battery staple';
const salt = crypto.getRandomValues(new Uint8Array(16));
const wrapIv = crypto.getRandomValues(new Uint8Array(12));
const rawVaultKey = crypto.getRandomValues(new Uint8Array(32));
const passwordMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
const wrappingKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 },
    passwordMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
);
const wrappedKey = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: wrapIv }, wrappingKey, rawVaultKey);
const metadata = {
    iterations: 600000,
    passwordWrap: { salt: toBase64(salt), iv: toBase64(wrapIv), ciphertext: toBase64(wrappedKey) },
};

const legacyKey = await crypto.subtle.importKey('raw', rawVaultKey, { name: 'AES-GCM' }, false, ['encrypt']);
const documentIv = crypto.getRandomValues(new Uint8Array(12));
const plaintext = { structuredData: { name: '舊文件' }, draftText: '等待轉換的密文內容' };
const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: documentIv }, legacyKey, encoder.encode(JSON.stringify(plaintext)),
);
const envelope = { version: 1, algorithm: 'AES-256-GCM', iv: toBase64(documentIv), ciphertext: toBase64(ciphertext) };

await assert.rejects(() => unlockVault('wrong password', metadata));
await unlockVault(password, metadata);
assert.deepEqual(await decryptPayload(envelope), plaintext);
console.log('Legacy encrypted document migration smoke check passed');
