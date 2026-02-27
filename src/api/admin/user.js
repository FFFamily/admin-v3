import request from "@/api/request"

// 用户分页列表
export function getAdminUserPage(params) {
  return request({
    url: "/admin/user/page",
    method: "get",
    params
  })
}

// 用户详情（建议后端聚合角色/部门信息）
export function getAdminUserInfo(id) {
  return request({
    url: `/admin/user/info/${id}`,
    method: "get"
  })
}

// 新增用户
export function createAdminUser(data) {
  return request({
    url: "/admin/user/create",
    method: "post",
    data
  })
}

// 编辑用户
export function updateAdminUser(data) {
  return request({
    url: "/admin/user/update",
    method: "put",
    data
  })
}

// 删除用户
export function deleteAdminUser(id) {
  return request({
    url: `/admin/user/delete/${id}`,
    method: "delete"
  })
}

// 批量删除用户
export function batchDeleteAdminUsers(ids) {
  return request({
    url: "/admin/user/batch",
    method: "delete",
    data: ids
  })
}

// 启用/禁用用户
export function changeAdminUserStatus(userId, status) {
  return request({
    url: "/admin/user/changeStatus",
    method: "put",
    data: { userId, status }
  })
}

// 重置密码（管理员）
export function resetAdminUserPassword(id, newPassword) {
  return request({
    url: `/admin/user/${id}/reset-password`,
    method: "put",
    data: { newPassword }
  })
}

// 修改密码（个人）
export function changeAdminUserPassword(id, oldPassword, newPassword) {
  return request({
    url: `/admin/user/${id}/change-password`,
    method: "put",
    data: { oldPassword, newPassword }
  })
}

// 分配角色（给用户）
export function setAdminUserRoles(id, roleIds) {
  return request({
    url: `/admin/user/${id}/roles`,
    method: "put",
    data: roleIds
  })
}

// 按部门查询用户（辅助）
export function getUsersByDept(deptId) {
  return request({
    url: `/admin/user/dept/${deptId}`,
    method: "get"
  })
}

// 按角色查询用户（辅助）
export function getUsersByRole(roleId) {
  return request({
    url: `/admin/user/role/${roleId}`,
    method: "get"
  })
}

