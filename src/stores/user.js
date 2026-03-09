import { defineStore } from "pinia"
import { preLogin as preLoginApi, listTenants as listTenantsApi, selectTenant as selectTenantApi, logout as logoutApi, getInfo as getInfoApi } from "@/api/user"
import { getToken, setToken, removeToken } from "@/utils/auth"
import { getPermissionsByUser } from "@/api/admin/permission"

export const useUserStore = defineStore("user", {
  state: () => ({
    token: getToken() || "",
    preToken: "",
    tenantOptions: [],
    id: "",
    name: "",
    avatar: "",
    perms: [],
    permsLoaded: false
  }),
  actions: {
    async preLogin({ username, password }) {
      // If switching accounts without a full reload, clear previous user profile/perms
      // so the router guard will re-fetch the new user's permissions.
      this.id = ""
      this.name = ""
      this.avatar = ""
      this.perms = []
      this.permsLoaded = false
      this.tenantOptions = []
      this.preToken = ""

      // Clear formal token before starting a new login flow.
      this.resetToken()

      const res = await preLoginApi({ username: (username || "").trim(), password })
      const data = res?.data || {}
      this.preToken = data?.preToken || ""
      this.tenantOptions = data?.tenants || []
      return data
    },

    async fetchTenants() {
      if (!this.preToken) return []
      const res = await listTenantsApi(this.preToken)
      const list = res?.data || []
      this.tenantOptions = list
      return list
    },

    async selectTenant(tenantId) {
      if (!this.preToken) {
        throw new Error("Missing preToken")
      }
      const res = await selectTenantApi(this.preToken, tenantId)
      const token = res?.data
      this.token = token || ""
      setToken(this.token)
      localStorage.setItem("last_tenant_id", tenantId)
      // Clear pre state after exchanging token.
      this.preToken = ""
      this.tenantOptions = []
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
      this.preToken = ""
      this.tenantOptions = []
      this.id = ""
      this.name = ""
      this.avatar = ""
      this.perms = []
      this.permsLoaded = false
    }
  }
})
