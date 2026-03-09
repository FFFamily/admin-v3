import request from "@/api/request"

// 平台：查询用户所属租户ID列表
export function getAdminUserTenantIds(userId) {
  return request({
    url: `/admin/user/${userId}/tenants`,
    method: "get"
  })
}

// 平台：设置用户所属租户（精确覆盖）
export function setAdminUserTenants(userId, tenantIds) {
  return request({
    url: `/admin/user/${userId}/tenants`,
    method: "put",
    data: { tenantIds }
  })
}

// 平台：追加用户所属租户（幂等）
export function addAdminUserTenants(userId, tenantIds) {
  return request({
    url: `/admin/user/${userId}/tenants`,
    method: "post",
    data: { tenantIds }
  })
}

// 平台：移除用户某租户成员关系
export function removeAdminUserTenant(userId, tenantId) {
  return request({
    url: `/admin/user/${userId}/tenant/${tenantId}`,
    method: "delete"
  })
}

