import NProgress from "nprogress"
import "nprogress/nprogress.css"

import { getToken } from "@/utils/auth"
import getPageTitle from "@/utils/get-page-title"
import { useUserStore } from "@/stores/user"

const whiteList = ["/login"]

export function setupPermission(router) {
  NProgress.configure({ showSpinner: false })

  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    document.title = getPageTitle(to.meta?.title)

    const hasToken = getToken()
    const userStore = useUserStore()

    if (hasToken) {
      if (to.path === "/login") {
        next({ path: "/" })
        NProgress.done()
      } else if (userStore.name) {
        next()
      } else {
        try {
          await userStore.getInfo()
          next()
        } catch (error) {
          userStore.resetToken()
          next(`/login?redirect=${to.fullPath}`)
          NProgress.done()
        }
      }
    } else if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
