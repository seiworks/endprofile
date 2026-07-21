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
import { useRouter } from 'vue-router';
import { login, setAuthToken } from '../../services/auth';

const email = ref('');
const password = ref('');
const submitting = ref(false);
const error = ref('');

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
        });

        setAuthToken(auth.token);
        store.dispatch('user/saveAuth', {
            token: auth.token,
            user: auth.user,
        });

        router.push({ name: 'home' });
    } catch (e) {
        console.error(e);
        if (e.code === 'ECONNABORTED') {
            error.value = '登入逾時，請確認後端與 MongoDB 是否已啟動。';
            return;
        }

        if (!e.response) {
            error.value = '無法連線到後端，請確認後端是否已啟動。';
            return;
        }

        const message = e.response && e.response.data && e.response.data.message;
        error.value = message || '登入失敗，請確認帳號密碼是否正確。';
    } finally {
        submitting.value = false;
    }
}
</script>
