const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'tasks', component: () => import('pages/TasksPage.vue') },
      { path: 'tasks/:id', component: () => import('pages/TaskDetailPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') }
    ]
  },

  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'signup', component: () => import('pages/SignupPage.vue') },
      { path: 'forgot-password', component: () => import('pages/ForgotPasswordPage.vue') },
      { path: '/set-password/:token/:uidb64', component: () => import('pages/SetPasswordPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes