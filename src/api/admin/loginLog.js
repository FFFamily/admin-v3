import request from "@/api/request"

// 登录日志分页
export function getLoginLogPage(params) {
  return request({
    url: "/admin/login-log/page",
    method: "get",
    params
  })
}

