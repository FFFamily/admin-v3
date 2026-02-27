import request from "@/api/request"

// 角色分页列表
export function getAdminRolePage(params) {
  return request({
    url: "/admin/role/page",
    method: "get",
    params
  })
}

// 所有启用角色（下拉）
export function getAllEnabledRoles() {
  return request({
    url: "/admin/role/all",
    method: "get"
  })
}

// 角色详情
export function getAdminRoleInfo(id) {
  return request({
    url: `/admin/role/${id}`,
    method: "get"
  })
}

// 创建角色
export function createAdminRole(data) {
  return request({
    url: "/admin/role",
    method: "post",
    data
  })
}

// 更新角色
export function updateAdminRole(data) {
  return request({
    url: "/admin/role",
    method: "put",
    data
  })
}

// 删除角色
export function deleteAdminRole(id) {
  return request({
    url: `/admin/role/${id}`,
    method: "delete"
  })
}

// 批量删除角色
export function batchDeleteAdminRoles(ids) {
  return request({
    url: "/admin/role/batch",
    method: "delete",
    data: ids
  })
}

// 角色绑定权限点
export function bindRolePermissions(id, permIds) {
  return request({
    url: `/admin/role/${id}/permissions`,
    method: "put",
    data: permIds
  })
}

// 根据用户ID查询角色列表（辅助）
export function getRolesByUserId(userId) {
  return request({
    url: `/admin/role/user/${userId}`,
    method: "get"
  })
}

