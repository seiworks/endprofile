import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import EndProfileView from '../views/EndProfileView.vue';
import WillWizard from '../components/pages/WillWizard.vue';
import CohabitationWizard from '../components/pages/CohabitationWizard.vue';
import GuardianshipWizard from '../components/pages/GuardianshipWizard.vue';
import JointPurchaseWizard from '../components/pages/JointPurchaseWizard.vue';
import LifeAuthorizationWizard from '../components/pages/LifeAuthorizationWizard.vue';
import Login from '../components/pages/Login.vue';
import Register from '../components/pages/Register.vue';
import store from '../store';

const routes = [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    {
        path: '/endprofile',
        name: 'endprofile',
        component: EndProfileView,
        meta: { requiresAuth: true },
        children: [
            { path: 'will', name: 'will', component: WillWizard },
            { path: 'cohabitation', name: 'cohabitation', component: CohabitationWizard },
            { path: 'guardianship', name: 'guardianship', component: GuardianshipWizard },
            { path: 'joint-purchase', name: 'joint-purchase', component: JointPurchaseWizard },
            { path: 'life-authorization', name: 'life-authorization', component: LifeAuthorizationWizard },
        ],
    },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta && record.meta.requiresAuth);
    const isAuthenticated = store.getters['user/isAuthenticated'];

    if (requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
        return;
    }

    if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
        next({ name: 'home' });
        return;
    }

    next();
});

export default router;
