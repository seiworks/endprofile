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
                    <h3 class="login-title">重設密碼</h3>
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
                                <input v-model="email" type="email" class="login-input" placeholder="請輸入註冊 Email" />
                            </div>
                        </div>
                        <div class="login-field">
                            <label class="login-label">
                                <span class="login-label-icon"><i class="mdi mdi-lock-outline" /></span>
                                <span>新密碼</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-lock-outline" />
                                </span>
                                <input v-model="password" type="password" class="login-input" placeholder="請輸入新密碼" />
                            </div>
                        </div>
                        <div class="login-field">
                            <label class="login-label">
                                <span class="login-label-icon"><i class="mdi mdi-lock-check-outline" /></span>
                                <span>再次輸入新密碼</span>
                            </label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon">
                                    <i class="mdi mdi-lock-check-outline" />
                                </span>
                                <input v-model="passwordConfirm" type="password" class="login-input"
                                    placeholder="請再次輸入新密碼" />
                            </div>
                        </div>
                        <button class="login-button" type="submit" :disabled="submitting">
                            {{ submitting ? '更新中…' : '更新密碼' }}
                        </button>
                        <p v-if="success" class="login-success">{{ success }}</p>
                        <p v-if="error" class="login-error">{{ error }}</p>
                        <p class="login-footer-text">
                            <router-link to="/login">回到登入</router-link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { resetPassword } from '../../services/auth';

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const submitting = ref(false);
const error = ref('');
const success = ref('');

async function onSubmit() {
    if (submitting.value) {
        return;
    }

    if (!email.value || !password.value || !passwordConfirm.value) {
        error.value = '請填寫 Email 與新密碼';
        success.value = '';
        return;
    }

    if (password.value.length < 6) {
        error.value = '密碼長度至少需要 6 碼';
        success.value = '';
        return;
    }

    if (password.value !== passwordConfirm.value) {
        error.value = '兩次輸入的新密碼不一致';
        success.value = '';
        return;
    }

    submitting.value = true;
    error.value = '';
    success.value = '';

    try {
        await resetPassword({
            email: email.value,
            password: password.value,
        });
        password.value = '';
        passwordConfirm.value = '';
        success.value = '密碼已更新，請回到登入頁使用新密碼登入。';
    } catch (e) {
        if (e.code === 'ECONNABORTED') {
            error.value = '重設密碼逾時，請確認後端與 MongoDB 是否已啟動。';
            return;
        }

        if (!e.response) {
            error.value = '無法連線到後端，請確認後端是否已啟動。';
            return;
        }

        const message = e.response && e.response.data && e.response.data.message;
        error.value = message || '重設密碼失敗，請確認 Email 是否正確。';
    } finally {
        submitting.value = false;
    }
}
</script>
