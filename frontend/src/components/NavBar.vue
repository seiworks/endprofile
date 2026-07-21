<template>
    <nav class="navbar navbar-expand-lg navbar-dark app-navbar">
        <div class="container">
            <router-link class="navbar-brand d-flex align-items-center" to="/">
                <span class="nav-feather-icon">
                    <i class="mdi mdi-feather" />
                </span>
                <span class="nav-brand-text">EndProfile</span>
            </router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon" />
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto" v-if="isAuthenticated">
                    <li v-for="document in DOCUMENTS" :key="document.type" class="nav-item">
                        <router-link class="nav-link" :to="document.route">{{ document.navTitle }}</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/tools/monthly-loan">貸款試算</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li v-if="!isAuthenticated" class="nav-item">
                        <router-link class="nav-link" to="/login">登入</router-link>
                    </li>
                    <li v-if="!isAuthenticated" class="nav-item">
                        <router-link class="nav-link" to="/register">註冊</router-link>
                    </li>
                    <li v-if="isAuthenticated" class="nav-item">
                        <button class="btn btn-link nav-link" type="button" @click="onLogout">
                            登出
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { setAuthToken } from '../services/auth';
import { DOCUMENTS } from '../constants/documents';

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);

function onLogout() {
    setAuthToken(null);
    store.dispatch('user/logout');
    router.push({ name: 'login' });
}
</script>
