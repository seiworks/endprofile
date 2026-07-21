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
                        <button class="login-button" type="submit" :disabled="submitting">
                            {{ submitting ? '登入中…' : '進入' }}
                        </button>
                        <p v-if="error" class="login-error">{{ error }}</p>
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
import { useRouter } from 'vue-router';
import { login, setAuthToken } from '../../services/auth';

const email = ref('');
const password = ref('');
const submitting = ref(false);
const error = ref('');

const store = useStore();
const router = useRouter();

async function onSubmit() {
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
        });

        setAuthToken(auth.token);
        store.dispatch('user/saveAuth', {
            token: auth.token,
            user: auth.user,
        });

        router.push({ name: 'home' });
    } catch (e) {
        error.value = '登入失敗，請確認帳號密碼是否正確。';
    } finally {
        submitting.value = false;
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px 40px;
    background: linear-gradient(to bottom, #1b3b70 0%, #3d6ca5 40%, #fddc9b 100%);
}

.login-overlay {
    max-width: 520px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    color: #ffffff;
}

.login-logo {
    text-align: center;
    animation: fadeInDown 0.5s ease-out both;
}

.login-logo-icon {
    font-size: 40px;
    margin-bottom: 4px;
}

.login-logo-text {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    font-size: 32px;
    letter-spacing: 3px;
}

.login-logo-main {
    font-weight: 600;
}

.login-logo-sub {
    font-weight: 300;
}

.login-card {
    width: 100%;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.14);
    box-shadow:
        0 18px 40px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(16px);
}

.login-card-inner {
    padding: 28px 28px 24px;
}

.login-field {
    margin-bottom: 18px;
}

.login-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #fef5dd;
    margin-bottom: 6px;
}

.login-label-icon {
    font-size: 16px;
}

.login-input-wrapper {
    position: relative;
}

.login-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: rgba(0, 0, 0, 0.3);
}

.login-input {
    width: 100%;
    border-radius: 999px;
    border: none;
    padding: 10px 14px 10px 40px;
    background-color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    color: #333333;
    outline: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-input:focus {
    box-shadow: 0 0 0 2px rgba(73, 123, 187, 0.7);
}

.login-button {
    width: 100%;
    margin-top: 8px;
    border-radius: 999px;
    border: none;
    padding: 11px 16px;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 4px;
    background: linear-gradient(90deg, #1f4b8f, #14345f);
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(10, 32, 77, 0.5);
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease,
        opacity 0.15s ease;
}

.login-button:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(10, 32, 77, 0.6);
}

.login-button:disabled {
    opacity: 0.7;
    cursor: default;
    box-shadow: none;
}

.login-error {
    margin-top: 12px;
    font-size: 13px;
    color: #ffebee;
}

.login-footer-text {
    margin-top: 12px;
    font-size: 13px;
    color: #fef5dd;
}

.login-footer-text a {
    color: #ffffff;
    text-decoration: underline;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 576px) {
    .login-card-inner {
        padding: 22px 18px 20px;
    }

    .login-logo-text {
        font-size: 26px;
    }
}
</style>
