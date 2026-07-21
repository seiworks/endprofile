const encoder = new TextEncoder();
const decoder = new TextDecoder();
const KDF_ITERATIONS = 600000;
let vaultKey = null;
let rememberedDevice = false;
const DEVICE_VAULT_DB = 'endprofile-device-vault';
const DEVICE_VAULT_STORE = 'vault';
const DEVICE_VAULT_RECORD = 'current';
const REMEMBER_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function toBase64(bytes) {
    const value = new Uint8Array(bytes);
    const chunkSize = 0x8000;
    let binary = '';
    for (let offset = 0; offset < value.length; offset += chunkSize) {
        binary += String.fromCharCode(...value.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
}
const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const randomBytes = (length) => crypto.getRandomValues(new Uint8Array(length));

async function deriveWrappingKey(secret, salt) {
    const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: KDF_ITERATIONS },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
}

async function importVaultKey(raw) {
    vaultKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function wrapVaultKey(rawVaultKey, secret, salt = randomBytes(16)) {
    const iv = randomBytes(12);
    const wrappingKey = await deriveWrappingKey(secret, salt);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, rawVaultKey);
    return { ciphertext: toBase64(ciphertext), iv: toBase64(iv), salt: toBase64(salt) };
}

export async function createVault(password) {
    const rawVaultKey = randomBytes(32);
    const recoverySecret = toBase64(randomBytes(32));
    const signingKeys = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'],
    );
    const recoveryPrivateKey = toBase64(await crypto.subtle.exportKey('pkcs8', signingKeys.privateKey));
    const recoveryPublicKey = toBase64(await crypto.subtle.exportKey('spki', signingKeys.publicKey));
    const recoveryKey = toBase64(encoder.encode(JSON.stringify({ secret: recoverySecret, privateKey: recoveryPrivateKey })));
    const passwordWrap = await wrapVaultKey(rawVaultKey, password);
    const recoveryWrap = await wrapVaultKey(rawVaultKey, recoverySecret);
    await importVaultKey(rawVaultKey);
    return {
        recoveryKey,
        metadata: { version: 1, kdf: 'PBKDF2-SHA256', iterations: KDF_ITERATIONS, passwordWrap, recoveryWrap, recoveryPublicKey },
    };
}

export async function unlockVault(password, metadata) {
    const wrap = metadata && metadata.passwordWrap;
    if (!wrap) throw new Error('此帳號尚未建立加密金鑰');
    const wrappingKey = await deriveWrappingKey(password, fromBase64(wrap.salt));
    const raw = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(wrap.iv) },
        wrappingKey,
        fromBase64(wrap.ciphertext),
    );
    await importVaultKey(raw);
}

export async function recoverVault(recoveryKey, newPassword, metadata) {
    const wrap = metadata && metadata.recoveryWrap;
    if (!wrap) throw new Error('此帳號沒有可用的復原金鑰');
    const recovery = JSON.parse(decoder.decode(fromBase64(recoveryKey)));
    const recoveryWrappingKey = await deriveWrappingKey(recovery.secret, fromBase64(wrap.salt));
    const rawVaultKey = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(wrap.iv) },
        recoveryWrappingKey,
        fromBase64(wrap.ciphertext),
    );
    const passwordWrap = await wrapVaultKey(new Uint8Array(rawVaultKey), newPassword);
    await importVaultKey(rawVaultKey);
    return { ...metadata, passwordWrap };
}

export async function signRecoveryChallenge(recoveryKey, challenge) {
    const recovery = JSON.parse(decoder.decode(fromBase64(recoveryKey)));
    const privateKey = await crypto.subtle.importKey(
        'pkcs8', fromBase64(recovery.privateKey), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'],
    );
    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' }, privateKey, fromBase64(challenge),
    );
    return toBase64(signature);
}

export function lockVault() {
    vaultKey = null;
    rememberedDevice = false;
}

export function isVaultUnlocked() {
    return Boolean(vaultKey);
}

function openDeviceVaultDb() {
    if (typeof indexedDB === 'undefined') return Promise.reject(new Error('此瀏覽器不支援裝置保險庫'));
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DEVICE_VAULT_DB, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(DEVICE_VAULT_STORE)) {
                request.result.createObjectStore(DEVICE_VAULT_STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('無法開啟裝置保險庫'));
    });
}

async function accessDeviceVault(mode, operation) {
    const db = await openDeviceVaultDb();
    try {
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(DEVICE_VAULT_STORE, mode);
            const request = operation(transaction.objectStore(DEVICE_VAULT_STORE));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('裝置保險庫操作失敗'));
        });
    } finally {
        db.close();
    }
}

export async function rememberVaultOnDevice(userId) {
    if (!vaultKey || !userId) throw new Error('加密資料庫尚未解鎖');
    await accessDeviceVault('readwrite', (store) => store.put({
        userId: String(userId),
        key: vaultKey,
        expiresAt: Date.now() + REMEMBER_DURATION_MS,
    }, DEVICE_VAULT_RECORD));
    rememberedDevice = true;
}

export async function restoreRememberedVault(userId) {
    if (!userId || typeof indexedDB === 'undefined') return false;
    const record = await accessDeviceVault('readonly', (store) => store.get(DEVICE_VAULT_RECORD));
    if (!record || record.userId !== String(userId) || record.expiresAt <= Date.now() || !record.key) {
        await forgetRememberedVault();
        return false;
    }
    vaultKey = record.key;
    rememberedDevice = true;
    return true;
}

export async function forgetRememberedVault() {
    rememberedDevice = false;
    if (typeof indexedDB === 'undefined') return;
    await accessDeviceVault('readwrite', (store) => store.delete(DEVICE_VAULT_RECORD));
}

export function isRememberedDevice() {
    return rememberedDevice;
}

export async function encryptPayload(value) {
    if (!vaultKey) throw new Error('加密資料庫尚未解鎖');
    const iv = randomBytes(12);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, vaultKey, encoder.encode(JSON.stringify(value)));
    return { version: 1, algorithm: 'AES-256-GCM', iv: toBase64(iv), ciphertext: toBase64(ciphertext) };
}

export async function decryptPayload(envelope) {
    if (!vaultKey) throw new Error('加密資料庫尚未解鎖');
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(envelope.iv) },
        vaultKey,
        fromBase64(envelope.ciphertext),
    );
    return JSON.parse(decoder.decode(plaintext));
}
