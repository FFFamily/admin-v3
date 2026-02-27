import { defineStore } from "pinia"
import { login as loginApi, logout as logoutApi, getInfo as getInfoApi } from "@/api/user"
import { getToken, setToken, removeToken } from "@/utils/auth"
import { getPermissionsByUser } from "@/api/admin/permission"

export const useUserStore = defineStore("user", {
  state: () => ({
    token: getToken() || "",
    id: "",
    name: "",
    avatar: "",
    perms: [],
    permsLoaded: false
  }),
  actions: {
    async login({ username, password }) {
      const res = await loginApi({ username: (username || "").trim(), password })
      const token = res?.data
      this.token = token || ""
      setToken(this.token)
      // Note: follow Vue2 logic - user info is fetched after login by guard/navbar.
      return token
    },
    async getInfo() {
      if (!getToken()) {
        throw new Error("No token")
      }
      const res = await getInfoApi()
      const data = res?.data
      if (!data) {
        throw new Error("Verification failed, please Login again.")
      }

      const { id, nickname, avatar } = data
      this.id = id || ""
      this.name = nickname || ""
      this.avatar = avatar || ""

      // Best-effort: load permission codes for button/menu visibility.
      // If backend doesn't support this yet, keep permsLoaded=false so UI won't be hidden.
      try {
        if (this.id) {
          const permRes = await getPermissionsByUser(this.id)
          const list = permRes?.data || []
          // Accept either ["user:list", ...] or [{ code: "user:list" }, ...]
          const codes = (list || [])
            .map(p => (typeof p === "string" ? p : p?.code))
            .filter(Boolean)
          this.perms = Array.from(new Set(codes))
          this.permsLoaded = true
        }
      } catch (e) {
        this.perms = []
        this.permsLoaded = false
      }
      return data
    },
    async logout() {
      try {
        await logoutApi()
      } finally {
        // Always clear local token even if backend logout fails.
        this.resetToken()
      }
    },
    resetToken() {
      removeToken()
      this.token = ""
      this.id = ""
      this.name = ""
      this.avatar = ""
      this.perms = []
      this.permsLoaded = false
    }
  }
})
