import request from '@/api/request'

export function getAdminUserList(params) {
  return request({
    url: '/ad/user/page',
    method: 'get',
    params
  })
}

export function addAdminUser(data) {
  return request({
    url: '/ad/user/add',
    method: 'post',
    data
  })
}

export function updateAdminUser(data) {
  return request({
    url: '/ad/user/update',
    method: 'post',
    data
  })
}

export function deleteAdminUser(id) {
  return request({
    url: `/ad/user/delete/${id}`,
    method: 'delete'
  })
}

export function getAdminUserInfo(id) {
  return request({
    url: `/ad/user/info/${id}`,
    method: 'get'
  })
}
