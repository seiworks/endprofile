// Transitional reader for documents created by the former browser-encryption design.
// New documents are stored as structuredData and draftText and never call this module.
const encoder = new TextEncoder();
const decoder = new TextDecoder();
let legacyVaultKey = null;

const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function deriveWrappingKey(password, wrap, metadata) {
    const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt: fromBase64(wrap.salt),
            iterations: Number(metadata.iterations) || 600000,
        },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt'],
    );
}

export async function unlockVault(password, metadata) {
    const wrap = metadata && metadata.passwordWrap;
    if (!wrap) throw new Error('舊文件缺少加密金鑰資料');
    const wrappingKey = await deriveWrappingKey(password, wrap, metadata);
    const raw = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(wrap.iv) },
        wrappingKey,
        fromBase64(wrap.ciphertext),
    );
    legacyVaultKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
}

export async function decryptPayload(envelope) {
    if (!legacyVaultKey) throw new Error('舊文件尚未解鎖');
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(envelope.iv) },
        legacyVaultKey,
        fromBase64(envelope.ciphertext),
    );
    return JSON.parse(decoder.decode(plaintext));
}
