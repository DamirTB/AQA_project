import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { guest: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/exams',
      name: 'ExamList',
      component: () => import('../views/ExamList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/exams/:id',
      name: 'ExamDetail',
      component: () => import('../views/ExamDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/attempt/:id',
      name: 'ExamAttempt',
      component: () => import('../views/ExamAttempt.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/results/:id',
      name: 'Results',
      component: () => import('../views/Results.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.guest && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
