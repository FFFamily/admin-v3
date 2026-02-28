import NProgress from "nprogress"
import "nprogress/nprogress.css"

import { getToken } from "@/utils/auth"
import getPageTitle from "@/utils/get-page-title"
import { useUserStore } from "@/stores/user"
import { constantRoutes } from "@/router"
import { filterRoutesForSidebar, findFirstMenuPath, isRouteAllowedByMenu } from "@/utils/route-permission"

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
        // Menu/page access control based on `menu:/path` permission codes.
        if (!isRouteAllowedByMenu(to, userStore.perms, userStore.permsLoaded, constantRoutes)) {
          const filtered = filterRoutesForSidebar(constantRoutes, userStore.perms, userStore.permsLoaded)
          const first = findFirstMenuPath(filtered)
          next(first || "/")
          NProgress.done()
          return
        }
        next()
      } else {
        try {
          await userStore.getInfo()
          if (!isRouteAllowedByMenu(to, userStore.perms, userStore.permsLoaded, constantRoutes)) {
            const filtered = filterRoutesForSidebar(constantRoutes, userStore.perms, userStore.permsLoaded)
            const first = findFirstMenuPath(filtered)
            next(first || "/")
            NProgress.done()
            return
          }
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
