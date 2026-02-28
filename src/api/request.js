import axios from "axios"
import { ElMessage, ElMessageBox } from "element-plus"

import { getToken } from "@/utils/auth"
import { useUserStore } from "@/stores/user"

let reloginDialogOpen = false

function toLoginUrl() {
  const base = import.meta.env.BASE_URL || "/"
  const normalized = base.endsWith("/") ? base : `${base}/`
  return `${normalized}login`
}

const service = axios.create({
  // Default to '/api' so dev proxy can work even when env is missing.
  baseURL: import.meta.env.VITE_BASE_API || "/api",
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers["Token-Key"] = token
    }
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    // Bypass the JSON envelope handling for file downloads / binary payloads.
    // Callers expect the raw axios `response` so they can read `response.data`.
    const rt = response?.config?.responseType
    if (rt === "blob" || rt === "arraybuffer") {
      return response
    }
    if (typeof Blob !== "undefined" && response.data instanceof Blob) {
      return response
    }

    const res = response.data
	    if (res.code !== 200) {
	      ElMessage({
	        message: res.msg || "Error",
	        type: "error",
	        duration: 5000
	      })
	      if (res.code === 401) {
	        // Avoid repeatedly popping dialogs and avoid calling backend logout (it may also require valid user state).
	        if (!reloginDialogOpen) {
	          reloginDialogOpen = true
	          ElMessageBox.confirm(
	            "您已退出登录，您可以取消留在当前页面，或重新登录",
	            "确认退出",
	            {
	              confirmButtonText: "重新登录",
	              cancelButtonText: "取消",
	              type: "warning"
	            }
	          )
	            .then(() => {
	              const userStore = useUserStore()
	              // Only clear local auth; do NOT call logout API here.
	              userStore.resetToken()
	              // Hard redirect so the app re-enters unauthenticated flow.
	              location.href = toLoginUrl()
	            })
	            .catch(() => {})
	            .finally(() => {
	              reloginDialogOpen = false
	            })
	        }
	      }
	      return Promise.reject(new Error(res.msg || "Error"))
	    }
    return res
  },
  error => {
    ElMessage({
      message: error.message,
      type: "error",
      duration: 5000
    })
    return Promise.reject(error)
  }
)

export default service
