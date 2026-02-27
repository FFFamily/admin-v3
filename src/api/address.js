import request from '@/api/request'

// 获取地址列表
export function getAddressList(params) {
  return request({
    url: '/address/list',
    method: 'get',
    params
  })
}

// 获取地址分页列表
export function getAddressPage(params) {
  return request({
    url: '/address/page',
    method: 'get',
    params
  })
}

// 创建地址
export function createAddress(data) {
  return request({
    url: '/address/create',
    method: 'post',
    data
  })
}

// 更新地址
export function updateAddress(data) {
  return request({
    url: '/address/update',
    method: 'put',
    data
  })
}

// 删除地址
export function deleteAddress(id) {
  return request({
    url: `/address/delete/${id}`,
    method: 'delete'
  })
}

// 获取地址详情
export function getAddressDetail(id) {
  return request({
    url: `/address/detail/${id}`,
    method: 'get'
  })
}

// 设为默认地址
export function setDefaultAddress(addressId) {
  return request({
    url: `/address/set-default/${addressId}`,
    method: 'put'
  })
}
