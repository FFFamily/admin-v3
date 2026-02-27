import request from '@/api/request'

// 获取银行信息列表
export function getBankInfoList(params) {
  return request({
    url: '/account/bank-card/page',
    method: 'get',
    params
  })
}

// 获取单个银行信息
export function getBankInfo(id) {
  return request({
    url: `/account/bank-card/get/${id}`,
    method: 'get'
  })
}

// 新增银行信息
export function createBankInfo(data) {
  return request({
    url: '/account/bank-card/add',
    method: 'post',
    data
  })
}

// 更新银行信息
export function updateBankInfo(data) {
  return request({
    url: '/account/bank-card/update',
    method: 'put',
    data
  })
}

// 删除银行信息
export function deleteBankInfo(id) {
  return request({
    url: `/account/bank-card/delete/${id}`,
    method: 'delete'
  })
}

// 设置默认银行信息
export function setDefaultBankInfo(id) {
  return request({
    url: `/account/bank-card/set-default/${id}`,
    method: 'put'
  })
}

// 根据用户ID获取银行账号列表
export function getBankInfoByUserId(accountId) {
  return request({
    url: `/account/bank-card/account/${accountId}`,
    method: 'get'
  })
}
