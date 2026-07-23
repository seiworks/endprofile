<template>
    <div class="login-page">
        <div class="login-overlay">
            <div class="login-card">
                <div class="login-card-inner">
                    <h3 class="login-title">重設密碼</h3>
                    <p class="login-footer-text">此功能只適用於你的本機環境。輸入已註冊 Email 即可設定新密碼。</p>
                    <form @submit.prevent="onSubmit">
                        <div class="login-field">
                            <label class="login-label">Email</label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon" aria-hidden="true">
                                    <i class="mdi mdi-email-outline"></i>
                                </span>
                                <input v-model="email" type="email" class="login-input" autocomplete="email" />
                            </div>
                        </div>
                        <div class="login-field">
                            <label class="login-label">新密碼（12 至 72 碼）</label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon" aria-hidden="true">
                                    <i class="mdi mdi-lock-outline"></i>
                                </span>
                                <input v-model="password" type="password" class="login-input"
                                    autocomplete="new-password" />
                            </div>
                        </div>
                        <div class="login-field">
                            <label class="login-label">再次輸入新密碼</label>
                            <div class="login-input-wrapper">
                                <span class="login-input-icon" aria-hidden="true">
                                    <i class="mdi mdi-lock-check-outline"></i>
                                </span>
                                <input v-model="passwordConfirm" type="password" class="login-input"
                                    autocomplete="new-password" />
                            </div>
                        </div>
                        <button class="login-button" type="submit" :disabled="submitting">
                            {{ submitting ? '更新中…' : '重設密碼' }}
                        </button>
                        <p v-if="success" class="login-success">{{ success }}</p>
                        <p v-if="error" class="login-error">{{ error }}</p>
                        <router-link class="login-secondary-button" to="/login">
                            <i class="mdi mdi-arrow-left" aria-hidden="true"></i>
                            回到登入
                        </router-link>
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
    error.value = '';
    success.value = '';
    if (!email.value || !password.value || !passwordConfirm.value) {
        error.value = '請填寫所有欄位';
        return;
    }
    if (password.value.length < 12 || password.value.length > 72) {
        error.value = '密碼長度需為 12 至 72 碼';
        return;
    }
    if (password.value !== passwordConfirm.value) {
        error.value = '兩次輸入的密碼不一致';
        return;
    }
    submitting.value = true;
    try {
        await resetPassword({ email: email.value, password: password.value });
        password.value = '';
        passwordConfirm.value = '';
        success.value = '密碼已更新，請回到登入頁使用新密碼。';
    } catch (e) {
        error.value = e.response?.data?.message || '重設失敗，請檢查 Email。';
    } finally {
        submitting.value = false;
    }
}
</script>
