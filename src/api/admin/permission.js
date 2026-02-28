import request from "@/api/request"

// 权限分页列表
export function getPermissionPage(params) {
  return request({
    url: "/admin/permission/page",
    method: "get",
    params
  })
}

// 权限树（菜单树）
export function getPermissionTree() {
  return request({
    url: "/admin/permission/tree",
    method: "get"
  })
}

// 权限详情
export function getPermissionInfo(id) {
  return request({
    url: `/admin/permission/${id}`,
    method: "get"
  })
}

// 创建权限
export function createPermission(data) {
  return request({
    url: "/admin/permission",
    method: "post",
    data
  })
}

// 更新权限
export function updatePermission(data) {
  return request({
    url: "/admin/permission",
    method: "put",
    data
  })
}

// 删除权限
export function deletePermission(id) {
  return request({
    url: `/admin/permission/${id}`,
    method: "delete"
  })
}

// 批量删除权限
export function batchDeletePermissions(ids) {
  return request({
    url: "/admin/permission/batch",
    method: "delete",
    data: ids
  })
}

// 根据角色查询权限列表（辅助）
export function getPermissionsByRole(roleId) {
  return request({
    url: `/admin/permission/role/${roleId}`,
    method: "get"
  })
}

// 根据用户查询权限列表（辅助）
export function getPermissionsByUser(userId) {
  return request({
    url: `/admin/permission/user/${userId}`,
    method: "get"
  })
}
