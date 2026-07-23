<template>
    <nav class="navbar navbar-expand-lg navbar-dark app-navbar">
        <div class="container">
            <router-link class="navbar-brand d-flex align-items-center" to="/" @click="closeMenu">
                <span class="nav-feather-icon">
                    <i class="mdi mdi-feather" />
                </span>
                <span class="nav-brand-text">EndProfile</span>
            </router-link>
            <button class="navbar-toggler" type="button" aria-controls="navbarNav" :aria-expanded="menuOpen"
                aria-label="切換導覽選單" @click="menuOpen = !menuOpen">
                <span class="navbar-toggler-icon" />
            </button>
            <div id="navbarNav" class="collapse navbar-collapse" :class="{ show: menuOpen }">
                <ul class="navbar-nav me-auto" v-if="isAuthenticated">
                    <li v-for="document in DOCUMENTS" :key="document.type" class="nav-item">
                        <router-link class="nav-link" :to="document.route" @click="closeMenu">
                            {{ document.navTitle }}
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/tools/monthly-loan" @click="closeMenu">貸款試算</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li v-if="!isAuthenticated" class="nav-item">
                        <router-link class="nav-link" to="/login" @click="closeMenu">登入</router-link>
                    </li>
                    <li v-if="!isAuthenticated" class="nav-item">
                        <router-link class="nav-link" to="/register" @click="closeMenu">註冊</router-link>
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
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { logout } from '../services/auth';
import { DOCUMENTS } from '../constants/documents';

const store = useStore();
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);

const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);

function closeMenu() {
    menuOpen.value = false;
}

async function onLogout() {
    closeMenu();
    if (route.name !== 'home') {
        const navigationFailure = await router.push({ name: 'home' });
        if (navigationFailure) return;
    }
    try {
        await logout();
    } catch {
        // Local UI logout must still complete when the session already expired.
    } finally {
        store.dispatch('user/logout');
        router.replace({ name: 'login' });
    }
}
</script>
