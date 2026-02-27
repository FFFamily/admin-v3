import request from '@/api/request'

// 获取后台用户分页列表
export function getAdminUserPage(params) {
  return request({
    url: '/admin/user/page',
    method: 'get',
    params
  })
}

// 创建后台用户
export function createAdminUser(data) {
  return request({
    url: '/admin/user/create',
    method: 'post',
    data
  })
}

// 更新后台用户
export function updateAdminUser(data) {
  return request({
    url: '/admin/user/update',
    method: 'put',
    data
  })
}

// 删除后台用户
export function deleteAdminUser(userId) {
  return request({
    url: '/admin/user/delete/' + userId,
    method: 'delete'
  })
}

// 获取部门列表
export function getDeptList() {
  return request({
    url: '/admin/dept/list',
    method: 'get'
  })
}
// 变更用户状态
export function changeAdminUserStatus(userId, status) {
  return request({
    url: '/admin/user/changeStatus',
    method: 'put',
    data: {
      userId: userId,
      status: status
    }
  })
}
