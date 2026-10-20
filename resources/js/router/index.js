import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '@/stores/app';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@/layouts/MainLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/DashboardView.vue'),
                },
                {
                    path: 'booking',
                    name: 'booking',
                    component: () => import('@/views/CustomerView.vue'),
                    meta: { role: 'customer' },
                },
                {
                    path: 'antrean',
                    name: 'antrean',
                    component: () => import('@/views/QueueView.vue'),
                    meta: { roles: ['customer', 'washer', 'admin'] },
                },
                {
                    path: 'tugas',
                    name: 'tugas',
                    component: () => import('@/views/WasherView.vue'),
                    meta: { role: 'washer' },
                },
                {
                    path: 'admin',
                    name: 'admin',
                    component: () => import('@/views/AdminView.vue'),
                    meta: { role: 'admin' },
                },
                {
                    path: 'pengaturan',
                    name: 'pengaturan',
                    component: () => import('@/views/SettingsView.vue'),
                },
            ],
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
        },
    ],
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('motowash_token');
    const user = JSON.parse(localStorage.getItem('motowash_user') || 'null');
    const allowedRoles = to.meta.roles || (to.meta.role ? [to.meta.role] : null);

    if (to.meta.requiresAuth && !token) {
        next({ name: 'login' });
    } else if (allowedRoles && !allowedRoles.includes(user?.role)) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router;
