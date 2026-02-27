import request from '@/api/request'

export function getAdminRoleList(params) {
  return request({
    url: '/admin/role/list',
    method: 'get',
    params
  })
}
export function addAdminRole(data) {
  return request({
    url: '/admin/role/add',
    method: 'post',
    data
  })
}
export function updateAdminRole(data) {
  return request({
    url: '/admin/role/update',
    method: 'post',
    data
  })
}
export function deleteAdminRole(id) {
  return request({
    url: `/admin/role/delete/${id}`,
    method: 'delete'
  })
}
export function getAdminRoleInfo(id) {
  return request({
    url: `/admin/role/info/${id}`,
    method: 'get'
  })
}
