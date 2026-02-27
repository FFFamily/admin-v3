import request from '@/api/request'

// 获取账号类型分页列表
export function getAccountTypePage(params) {
  return request({
    url: '/system/accountType/page',
    method: 'get',
    params
  })
}

// 获取账号类型列表（不分页）
export function getAccountTypeList() {
  return request({
    url: '/system/accountType/list',
    method: 'get'
  })
}

// 新增账号类型
export function addAccountType(data) {
  return request({
    url: '/system/accountType/add',
    method: 'post',
    data
  })
}

// 更新账号类型
export function updateAccountType(data) {
  return request({
    url: `/system/accountType/update`,
    method: 'put',
    data
  })
}

// 删除账号类型
export function deleteAccountType(id) {
  return request({
    url: `/system/accountType/delete/${id}`,
    method: 'delete'
  })
}

// 获取账号类型详情
export function getAccountTypeById(id) {
  return request({
    url: `/system/accountType/get/${id}`,
    method: 'get'
  })
}
