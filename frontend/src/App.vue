<template>
    <div class="app-root sunny-bg">
        <NavBar v-if="showNavBar" />
        <main class="app-main">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { logout } from './services/auth';
import { isRememberedDevice, lockVault } from './services/vault';

const store = useStore();
const router = useRouter();
const IDLE_LOCK_MS = 30 * 60 * 1000;
const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
let idleTimer = null;
let lastActivityAt = Date.now();
let locking = false;

const showNavBar = computed(() => store.getters['user/isAuthenticated']);

function clearIdleTimer() {
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = null;
}

function scheduleIdleLock() {
    clearIdleTimer();
    if (!showNavBar.value || isRememberedDevice()) return;
    const remaining = Math.max(IDLE_LOCK_MS - (Date.now() - lastActivityAt), 0);
    idleTimer = window.setTimeout(lockForInactivity, remaining);
}

function recordActivity() {
    if (!showNavBar.value) return;
    lastActivityAt = Date.now();
    scheduleIdleLock();
}

async function lockForInactivity() {
    if (locking || !showNavBar.value) return;
    locking = true;
    clearIdleTimer();
    lockVault();
    store.dispatch('user/logout');
    await router.replace({ name: 'login', query: { reason: 'inactive' } });
    try {
        await logout();
    } catch {
        // The local vault is already locked even if the server is temporarily unreachable.
    } finally {
        locking = false;
    }
}

function handleVisibilityChange() {
    if (document.visibilityState !== 'visible' || !showNavBar.value) return;
    if (Date.now() - lastActivityAt >= IDLE_LOCK_MS) lockForInactivity();
    else scheduleIdleLock();
}

watch(showNavBar, (authenticated) => {
    if (authenticated) {
        lastActivityAt = Date.now();
        scheduleIdleLock();
    } else {
        clearIdleTimer();
    }
});

onMounted(() => {
    for (const event of activityEvents) window.addEventListener(event, recordActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (showNavBar.value) scheduleIdleLock();
});

onUnmounted(() => {
    clearIdleTimer();
    for (const event of activityEvents) window.removeEventListener(event, recordActivity);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});
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
