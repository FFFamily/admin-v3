import request from "@/api/request"

// 审计日志分页
export function getAuditLogPage(params) {
  return request({
    url: "/admin/audit-log/page",
    method: "get",
    params
  })
}

