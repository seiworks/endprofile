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
                    <h3 class="login-title">建立帳號</h3>
                    <form @submit.prevent="onSubmit">
                        <div class="login-field">
                            <label class="login-label">
                                <span class="login-label-icon"><i class="mdi mdi-account-outline" /></span>
                                <span>名稱</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-account-outline" />
                                </span>
                                <input v-model="name" type="text" class="login-input" placeholder="請輸入名稱" />
                            </div>
                        </div>
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
                                <span>密碼</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-lock-outline" />
                                </span>
                                <input v-model="password" type="password" class="login-input" placeholder="請輸入密碼" />
                            </div>
                        </div>
                        <div class="login-field">
                            <label class="login-label">
                                <span class="login-label-icon"><i class="mdi mdi-lock-check-outline" /></span>
                                <span>再次輸入密碼</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-lock-check-outline" />
                                </span>
                                <input v-model="passwordConfirm" type="password" class="login-input"
                                    placeholder="請再次輸入密碼" />
                            </div>
                        </div>
                        <button class="login-button" type="submit" :disabled="submitting">
                            {{ submitting ? '註冊中…' : '建立帳號' }}
                        </button>
                        <p v-if="error" class="login-error">{{ error }}</p>
                        <p class="login-footer-text">
                            已經有帳號了？
                            <router-link to="/login">前往登入</router-link>
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
import { login, register, setAuthToken } from '../../services/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const submitting = ref(false);
const error = ref('');

const store = useStore();
const router = useRouter();

async function onSubmit() {
    if (submitting.value) {
        return;
    }

    if (!name.value || !email.value || !password.value || !passwordConfirm.value) {
        error.value = '請填寫所有欄位';
        return;
    }
    if (password.value !== passwordConfirm.value) {
        error.value = '兩次輸入的密碼不一致';
        return;
    }

    submitting.value = true;
    error.value = '';

    try {
        await register({
            name: name.value,
            email: email.value,
            password: password.value,
        });

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
        if (e.code === 'ECONNABORTED') {
            error.value = '註冊逾時，請確認後端與 MongoDB 是否已啟動。';
            return;
        }

        if (!e.response) {
            error.value = '無法連線到後端，請確認後端是否已啟動。';
            return;
        }

        const message = e.response && e.response.data && e.response.data.message;
        error.value = message || '註冊失敗，請確認 Email 是否已註冊或稍後再試。';
    } finally {
        submitting.value = false;
    }
}
</script>
