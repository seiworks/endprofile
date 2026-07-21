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
                    <li class="nav-item">
                        <router-link class="nav-link" to="/endprofile/will">預立遺囑</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/endprofile/cohabitation">同居協議</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/endprofile/joint-purchase">共同購屋協議</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/endprofile/life-authorization">生活授權</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/endprofile/guardianship">意定監護</router-link>
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

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);

function onLogout() {
    setAuthToken(null);
    store.dispatch('user/logout');
    router.push({ name: 'login' });
}
</script>
