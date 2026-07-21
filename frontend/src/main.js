import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import axios from 'axios';
import { forgetRememberedVault, lockVault, restoreRememberedVault } from './services/vault';
import { getCurrentUser } from './services/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@mdi/font/css/materialdesignicons.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/css/base.css';
import './assets/css/layout.css';
import './assets/css/form.css';
import './assets/css/auth.css';

const app = createApp(App);

axios.defaults.withCredentials = true;
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && store.getters['user/isAuthenticated']) {
            lockVault();
            forgetRememberedVault().catch(() => {});
            store.dispatch('user/logout');
            if (router.currentRoute.value.name !== 'login') {
                router.replace({ name: 'login', query: { reason: 'session' } });
            }
        }
        return Promise.reject(error);
    },
);

app.use(store);
app.use(vuetify);

async function bootstrap() {
    try {
        const user = await getCurrentUser();
        if (await restoreRememberedVault(user.id || user._id)) {
            await store.dispatch('user/saveAuth', { user });
        }
    } catch (error) {
        if (error.response?.status === 401) await forgetRememberedVault().catch(() => {});
    }

    app.use(router);
    await router.isReady();
    app.mount('#app');
}

bootstrap();
