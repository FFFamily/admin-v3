import request from '@/api/request'

export function login(data) {
  return request({
    url: '/ad/auth/login',
    method: 'post',
    data
  })
}

// 获取用户列表
export function getUserList() {
  return request({
    url: '/wx/user/list',
    method: 'get'
  })
}

export function getInfo() {
  return request({
    url: '/ad/auth/getLoginInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/ad/auth/logout',
    method: 'get'
  })
}

// 创建用户
export function createWxUser(data) {
  return request({
    url: '/wx/user/create',
    method: 'post',
    data
  })
}
// 更新用户
export function updateWxUser(data) {
  return request({
    url: '/wx/user/update',
    method: 'put',
    data
  })
}
// 变更用户状态
export function changeWxUserStatus(userId) {
  return request({
    url: '/wx/user/changeStatus',
    method: 'put',
    params: {
      id: userId
    }
  })
}
// 删除用户
export function deleteWxUser(userId) {
  return request({
    url: '/wx/user/delete/' + userId,
    method: 'delete'
  })
}
// 变更用户使用类型
export function changeWxUserType(userId, type) {
  return request({
    url: '/wx/user/changeUseType',
    method: 'put',
    params: {
      userId,
      useType: type
    }
  })
}
// 变更用户业务类型（供应商 / 服务商）
export function changeWxUserBusinessType(userId, businessType) {
  return request({
    url: '/wx/user/changeAccountBusinessType',
    method: 'put',
    params: {
      id: userId,
      businessType
    }
  })
}
// 用户分页列表
export function getUserPage(params) {
  return request({
    url: '/wx/user/page',
    method: 'get',
    params
  })
}

// 根据用户类型生成对应的用户账号
export function generateAccountUsername(id, accountType) {
  return request({
    url: '/wx/user/generateAccountUsername/' + accountType,
    method: 'get',
    params: {
      accountId: id
    }
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/wx/user/info/${id}`,
    method: 'get'
  })
}
// 获取后台配置的所有的身份列表
export function getUseTypeList() {
  return request({
    url: '/wx/user/useTypeList',
    method: 'get'
  })
}
