import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import store from '../store';

const EndProfileView = () => import('../views/EndProfileView.vue');
const WillWizard = () => import('../components/pages/WillWizard.vue');
const CohabitationWizard = () => import('../components/pages/CohabitationWizard.vue');
const GuardianshipWizard = () => import('../components/pages/GuardianshipWizard.vue');
const JointPurchaseWizard = () => import('../components/pages/JointPurchaseWizard.vue');
const LifeAuthorizationWizard = () => import('../components/pages/LifeAuthorizationWizard.vue');
const MonthlyLoanCalculator = () => import('../components/pages/MonthlyLoanCalculator.vue');
const Login = () => import('../components/pages/Login.vue');
const Register = () => import('../components/pages/Register.vue');
const ForgotPassword = () => import('../components/pages/ForgotPassword.vue');

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
    {
        path: '/tools/monthly-loan',
        name: 'monthly-loan-calculator',
        component: MonthlyLoanCalculator,
        meta: { requiresAuth: true },
    },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },
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

    if ((to.name === 'login' || to.name === 'register' || to.name === 'forgot-password') && isAuthenticated) {
        next({ name: 'home' });
        return;
    }

    next();
});

export default router;
