<template>
    <div class="login-page">
        <div class="login-overlay">
            <div class="login-logo">
                <div class="login-logo-icon">
                    <i class="mdi mdi-feather" />
                </div>
                <div class="login-logo-text">
                    <span class="login-logo-main">人生</span>
                    <span class="login-logo-sub">EndProfile</span>
                </div>
            </div>
            <div class="login-card">
                <div class="login-card-inner">
                    <form @submit.prevent="onSubmit">
                        <div class="login-field">
                            <label class="login-label">
                                <span class="login-label-icon"><i class="mdi mdi-email-outline" /></span>
                                <span>Email</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-email-outline" />
                                </span>
                                <input v-model="email" type="email" class="login-input" placeholder="請輸入 Email" />
                            </div>
                        </div>
                        <div class="login-field">
                            <label class="login-label">
                                <span class="login-label-icon"><i class="mdi mdi-lock-outline" /></span>
                                <span>Password</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-lock-outline" />
                                </span>
                                <input v-model="password" type="password" class="login-input" placeholder="請輸入密碼" />
                            </div>
                        </div>
                        <label class="login-remember-row">
                            <input v-model="rememberMe" type="checkbox" />
                            <span>記住 Email 並在這台裝置保持登入 7 天</span>
                        </label>
                        <p v-if="rememberMe" class="login-security-note">
                            只適合個人裝置；共用電腦請不要勾選。
                        </p>
                        <button class="login-button" type="submit" :disabled="submitting">
                            {{ submitting ? '登入中…' : '進入' }}
                        </button>
                        <p v-if="error" class="login-error">{{ error }}</p>
                        <div v-if="recoveryKey" class="login-success">
                            <strong>舊帳號已升級，請保存復原金鑰</strong>
                            <p class="mt-2 mb-2 text-break">{{ recoveryKey }}</p>
                            <button type="button" class="btn btn-outline-light btn-sm mb-2"
                                @click="downloadRecoveryKey">
                                下載復原金鑰
                            </button>
                            <button type="button" class="login-button" @click="continueToHome">我已安全保存，繼續</button>
                        </div>
                        <p class="login-footer-text">
                            <router-link to="/forgot-password">忘記密碼？</router-link>
                        </p>
                        <p class="login-footer-text">
                            還沒有帳號？
                            <router-link to="/register">建立新帳號</router-link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { initializeVault, login } from '../../services/auth';
import {
    createVault, forgetRememberedVault, rememberVaultOnDevice, unlockVault,
} from '../../services/vault';
import { migrateLegacyDocuments } from '../../services/documentMigration';

const REMEMBERED_EMAIL_KEY = 'endprofile.rememberedEmail';
const savedEmail = typeof localStorage === 'undefined' ? '' : localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
const email = ref(savedEmail);
const password = ref('');
const rememberMe = ref(Boolean(savedEmail));
const submitting = ref(false);
const route = useRoute();
const initialMessage = route.query.reason === 'inactive'
    ? '已因閒置 30 分鐘自動登出，請重新登入。'
    : route.query.reason === 'session' ? '登入已過期或在其他裝置登出，請重新登入。' : '';
const error = ref(initialMessage);
const recoveryKey = ref('');

const store = useStore();
const router = useRouter();

async function onSubmit() {
    if (submitting.value) {
        return;
    }

    if (!email.value || !password.value) {
        error.value = '請輸入 Email 與密碼';
        return;
    }

    submitting.value = true;
    error.value = '';

    try {
        const auth = await login({
            email: email.value,
            password: password.value,
            rememberMe: rememberMe.value,
        });

        if (auth.vaultMetadata) {
            await unlockVault(password.value, auth.vaultMetadata);
        } else {
            const vault = await createVault(password.value);
            await initializeVault(vault.metadata);
            recoveryKey.value = vault.recoveryKey;
        }
        if (rememberMe.value) {
            localStorage.setItem(REMEMBERED_EMAIL_KEY, email.value.trim().toLowerCase());
            await rememberVaultOnDevice(auth.user.id);
        } else {
            localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            await forgetRememberedVault();
        }
        store.dispatch('user/saveAuth', {
            user: auth.user,
        });
        await migrateLegacyDocuments();

        password.value = '';
        if (!recoveryKey.value) router.push({ name: 'home' });
    } catch (e) {
        if (e.code === 'ECONNABORTED') {
            error.value = '登入逾時，請確認後端與 MongoDB 是否已啟動。';
            return;
        }

        if (!e.response) {
            error.value = e.message?.includes('裝置保險庫')
                ? '此瀏覽器無法安全保留登入，請取消勾選後重試。'
                : '無法連線到後端，請確認後端是否已啟動。';
            return;
        }

        const message = e.response && e.response.data && e.response.data.message;
        error.value = message || '登入失敗，請確認帳號密碼是否正確。';
    } finally {
        submitting.value = false;
    }
}

function continueToHome() {
    recoveryKey.value = '';
    router.push({ name: 'home' });
}

function downloadRecoveryKey() {
    const blob = new Blob([recoveryKey.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'endprofile-recovery-key.txt';
    link.click();
    URL.revokeObjectURL(url);
}
</script>
