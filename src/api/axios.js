import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// 1. 建立一個 Axios 實例
const service = axios.create({
  baseURL: '/api', // 使用相對路徑，透過 Vite 代理轉發到後端
  timeout: 15000,
  //  關鍵：開啟此設定後，每次發送 API，瀏覽器都會自動把同網域的 HttpOnly Cookie 塞進請求中！
  withCredentials: true,
})

// 1. 設定請求攔截器 (可選：用於調試)
service.interceptors.request.use(
  (config) => {
    console.log(' 發送請求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 2. 設定回應攔截器 (Response Interceptor)
service.interceptors.response.use(
  (response) => {
    // 後端統一包裝 { success, data, message }：
    //  - success === false（HTTP 200 的業務失敗）→ 轉成 reject，呼叫端統一用 catch 處理
    //  - success === true → 解包，讓呼叫端的 res.data 直接是內層資料
    const body = response.data
    if (body && typeof body === 'object' && !Array.isArray(body) && 'success' in body) {
      if (body.success === false) {
        const err = new Error(body.message || '操作失敗')
        err.response = response
        err.isBusinessError = true
        return Promise.reject(err)
      }
      response.message = body.message
      response.data = body.data
    }
    return response
  },
  (error) => {
    console.log(' 請求失敗:', error.config?.url, error.response?.status)

    // 把後端回傳的錯誤訊息放到 error.message，呼叫端統一讀 err.message
    const serverMsg = error.response?.data?.message
    if (serverMsg) error.message = serverMsg

    //  處理 401 Unauthorized - 未認證，跳轉到登入頁
    //  skipAuthRedirect：用於「確認是否已登入」的請求，未登入是正常結果，不需跳轉
    if (error.response && error.response.status === 401 && !error.config?.skipAuthRedirect) {
      const authStore = useAuthStore()
      const currentPath = window.location.pathname

      // 清除登入資訊
      authStore.clearLoginInfo()

      // 根據當前路徑判斷跳轉到前台或後台登入頁
      if (currentPath.startsWith('/dashboard')) {
        // 後台路徑，跳到後台登入頁
        if (currentPath !== '/dashboard/login') {
          console.log(' 401 未認證，跳轉到後台登入頁')
          router.push('/dashboard/login')
        }
      } else {
        // 前台路徑，跳到登入頁
        if (currentPath !== '/login') {
          console.log(' 401 未認證，跳轉到前台登入頁')
          router.replace('/login').then(() => window.location.reload())
        }
      }
    }

    //  處理 403 Forbidden - 已認證但權限不足，跳轉到權限不足頁面
    if (error.response && error.response.status === 403) {
      const currentPath = window.location.pathname

      // 根據當前路徑判斷跳轉到前台或後台權限不足頁面
      if (currentPath.startsWith('/dashboard')) {
        if (currentPath !== '/dashboard/error-403') {
          console.log(' 403 權限不足，跳轉到權限不足頁面')
          router.push('/dashboard/error-403')
        }
      } else {
        // 前台路徑，跳到前台 403 頁面
        if (currentPath !== '/error-403') {
          console.log(' 403 權限不足，跳轉到前台 403 頁面')
          router.push('/error-403')
        }
      }
    }
    return Promise.reject(error)
  },
)

export default service
