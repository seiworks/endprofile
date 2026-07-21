import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { indexedDB } from 'fake-indexeddb';
import {
    createVault, decryptPayload, encryptPayload, forgetRememberedVault, isRememberedDevice,
    lockVault, recoverVault, rememberVaultOnDevice, restoreRememberedVault,
    signRecoveryChallenge, unlockVault,
} from '../src/services/vault.js';

globalThis.indexedDB = indexedDB;

const vault = await createVault('correct horse battery staple');
const envelope = await encryptPayload({ private: '只有使用者看得到' });
assert.deepEqual(await decryptPayload(envelope), { private: '只有使用者看得到' });
const largePayload = { draftText: 'x'.repeat(180000) };
const largeEnvelope = await encryptPayload(largePayload);
assert.deepEqual(await decryptPayload(largeEnvelope), largePayload);
await rememberVaultOnDevice('user-1');
assert.equal(isRememberedDevice(), true);
lockVault();
assert.equal(await restoreRememberedVault('user-1'), true);
assert.deepEqual(await decryptPayload(envelope), { private: '只有使用者看得到' });
await forgetRememberedVault();
lockVault();
assert.equal(await restoreRememberedVault('user-1'), false);
await unlockVault('correct horse battery staple', vault.metadata);
lockVault();
await assert.rejects(() => unlockVault('wrong password', vault.metadata));
await unlockVault('correct horse battery staple', vault.metadata);
assert.deepEqual(await decryptPayload(envelope), { private: '只有使用者看得到' });
lockVault();
const recoveredMetadata = await recoverVault(vault.recoveryKey, 'a different strong password', vault.metadata);
lockVault();
await unlockVault('a different strong password', recoveredMetadata);
assert.deepEqual(await decryptPayload(envelope), { private: '只有使用者看得到' });
const challenge = crypto.randomBytes(32);
const signature = await signRecoveryChallenge(vault.recoveryKey, challenge.toString('base64'));
assert.equal(crypto.verify(
    'sha256', challenge,
    { key: crypto.createPublicKey({ key: Buffer.from(vault.metadata.recoveryPublicKey, 'base64'), format: 'der', type: 'spki' }), dsaEncoding: 'ieee-p1363' },
    Buffer.from(signature, 'base64'),
), true);
console.log('Vault smoke check passed');
