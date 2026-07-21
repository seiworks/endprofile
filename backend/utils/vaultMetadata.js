function isBase64(value, maxLength = 512) {
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength
        && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

function normalizeWrap(value) {
    if (!value || !isBase64(value.ciphertext) || !isBase64(value.iv, 64) || !isBase64(value.salt, 64)) {
        return null;
    }
    return { ciphertext: value.ciphertext, iv: value.iv, salt: value.salt };
}

function normalizeVaultMetadata(value) {
    if (!value || value.version !== 1 || value.kdf !== 'PBKDF2-SHA256' || value.iterations !== 600000) {
        return null;
    }
    const passwordWrap = normalizeWrap(value.passwordWrap);
    const recoveryWrap = normalizeWrap(value.recoveryWrap);
    if (!passwordWrap || !recoveryWrap || !isBase64(value.recoveryPublicKey, 256)) return null;
    return {
        version: 1, kdf: 'PBKDF2-SHA256', iterations: 600000,
        passwordWrap, recoveryWrap, recoveryPublicKey: value.recoveryPublicKey,
    };
}

module.exports = normalizeVaultMetadata;
