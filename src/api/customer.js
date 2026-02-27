import request from '@/api/request'

// 获取服务商的客户列表
export function getCustomerList(accountId) {
  return request({
    url: `/account/customer/account/${accountId}`,
    method: 'get'
  })
}

// 添加客户
export function addCustomer(data) {
  return request({
    url: '/account/customer/add',
    method: 'post',
    data
  })
}

// 删除客户
export function deleteCustomer(id) {
  return request({
    url: `/account/customer/delete/${id}`,
    method: 'delete'
  })
}

