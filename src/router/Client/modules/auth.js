export default [
  {
    path: '/login',
    name: 'LoginLayout',
    component: () => import('@/layouts/Client/SigninLayout.vue'),
    children: [
      {
        path: '',
        name: 'Client-login',
        component: () => import('@/components/Client/auth/Signin.vue'),
        meta: {
          title: '登入 | Petmily 寵物媒合平台',
        },
      },
    ],
  },
  {
    path: '/signup',
    name: 'SignupLayout',
    component: () => import('@/layouts/Client/SigninLayout.vue'),
    children: [
      {
        path: '',
        name: 'Client-signup',
        component: () => import('@/components/Client/auth/Signup.vue'),
        meta: {
          title: '註冊 | Petmily 寵物媒合平台',
        },
      },
    ],
  },
  {
    path: '/reset-password',
    name: 'ResetPasswordLayout',
    component: () => import('@/layouts/Client/SigninLayout.vue'),
    children: [
      {
        path: '',
        name: 'Client-reset-password',
        component: () => import('@/components/Client/auth/ForgotPassword.vue'),
        meta: {
          title: '忘記密碼 | Petmily 寵物媒合平台',
        },
      },
    ],
  },
  {
    path: '/reset-password/confirm',
    name: 'ResetPasswordConfirmLayout',
    component: () => import('@/layouts/Client/SigninLayout.vue'),
    children: [
      {
        path: '',
        name: 'Client-reset-password-confirm',
        component: () => import('@/components/Client/auth/ResetPasswordWithToken.vue'),
        meta: {
          title: '設定新密碼 | Petmily 寵物媒合平台',
        },
      },
    ],
  },
]
