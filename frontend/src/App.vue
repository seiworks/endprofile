<template>
    <div class="app-root sunny-bg">
        <NavBar v-if="showNavBar" />
        <main class="app-main">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import NavBar from './components/NavBar.vue';

const store = useStore();

const showNavBar = computed(() => store.getters['user/isAuthenticated']);
</script>

<style scoped>
.app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-main {
    flex: 1;
}
</style>
