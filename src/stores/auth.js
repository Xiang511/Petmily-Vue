import { defineStore } from 'pinia'

// 舊版會把整包使用者資料（含 Email、電話、生日）寫進 localStorage，這裡一併清除
try {
  localStorage.removeItem('pawsport-auth')
} catch {
  // 瀏覽器封鎖儲存空間時忽略
}

// 只保留一次進行中的 /Auth/me 請求，避免多個路由同時重複呼叫
let initPromise = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 只存顯示與識別用的精簡資料：userId、name、photo
    userInfo: null,
    isLoggedIn: false,
    // 是否已向後端確認過登入狀態（每次重新整理網頁都從 false 開始）
    isInitialized: false,
  }),

  actions: {
    setLoginInfo(user) {
      this.userInfo = {
        userId: user.userId ?? user.id,
        name: user.name,
        photo: user.photo,
      }
      this.isLoggedIn = true
      this.isInitialized = true
    },
    clearLoginInfo() {
      this.userInfo = null
      this.isLoggedIn = false
    },

    /**
     * 向後端確認目前的登入狀態（以 HttpOnly Cookie 為準）
     * GET /api/Auth/me
     * @param {boolean} force 是否忽略已完成的結果，重新向後端確認
     */
    initAuth(force = false) {
      if (initPromise && !force) return initPromise

      initPromise = (async () => {
        try {
          // 動態載入，避免 store 與 axios 設定互相循環引用
          const { default: request } = await import('@/api/axios')
          const res = await request.get('/Auth/me', { skipAuthRedirect: true })
          const user = res.data?.user
          if (user) {
            this.setLoginInfo(user)
          } else {
            this.clearLoginInfo()
          }
        } catch {
          // 401 或網路錯誤一律視為未登入
          this.clearLoginInfo()
        } finally {
          this.isInitialized = true
        }
      })()

      return initPromise
    },
  },

  // 登入狀態以後端為準，不寫入 localStorage
})
