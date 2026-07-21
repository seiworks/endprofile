import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import { setAuthToken } from './services/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@mdi/font/css/materialdesignicons.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/css/base.css';
import './assets/css/layout.css';
import './assets/css/form.css';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);

store.dispatch('user/initialize');

if (store.getters['user/isAuthenticated']) {
    setAuthToken(store.state.user.token);
}

app.mount('#app');
