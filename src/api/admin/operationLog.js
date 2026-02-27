import request from "@/api/request"

// 操作日志分页
export function getOperationLogPage(params) {
  return request({
    url: "/admin/operation-log/page",
    method: "get",
    params
  })
}

// 操作日志详情
export function getOperationLogInfo(id) {
  return request({
    url: `/admin/operation-log/${id}`,
    method: "get"
  })
}

// 操作日志统计
export function getOperationLogStatistics() {
  return request({
    url: "/admin/operation-log/statistics",
    method: "get"
  })
}

// 清理操作日志
export function cleanOperationLog(days) {
  return request({
    url: "/admin/operation-log/clean",
    method: "delete",
    params: { days }
  })
}

