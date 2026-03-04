import request from "@/api/request"

// 租户分页
export function getTenantPage(params) {
  return request({
    url: "/admin/tenant/page",
    method: "get",
    params
  })
}

// 租户详情
export function getTenantInfo(id) {
  return request({
    url: `/admin/tenant/${id}`,
    method: "get"
  })
}

// 创建租户
export function createTenant(data) {
  return request({
    url: "/admin/tenant",
    method: "post",
    data
  })
}

// 更新租户
export function updateTenant(data) {
  return request({
    url: "/admin/tenant",
    method: "put",
    data
  })
}

// 启用/停用租户
export function changeTenantStatus(id, status) {
  return request({
    url: `/admin/tenant/${id}/status`,
    method: "put",
    params: { status }
  })
}

// 删除租户
export function deleteTenant(id) {
  return request({
    url: `/admin/tenant/${id}`,
    method: "delete"
  })
}

// 初始化租户管理员（SUPER_ADMIN）
export function bootstrapTenantAdmin(id, data) {
  return request({
    url: `/admin/tenant/${id}/bootstrap-admin`,
    method: "post",
    data
  })
}

