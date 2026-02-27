import request from '@/api/request'

// 资金池分页查询
export function getCapitalPoolPage(params) {
  return request({
    url: '/recycle/capital-pool/page',
    method: 'post',
    params
  })
}
// 根据合同号获取资金池
export function getCapitalPoolByContractNo(contractNo) {
  return request({
    url: `/recycle/capital-pool/getByContractNo/${contractNo}`,
    method: 'get'
  })
}

// 资金池详情
export function getCapitalPoolDetail(id) {
  return request({
    url: `/recycle/capital-pool/${id}`,
    method: 'get'
  })
}

// 新增资金池
export function createCapitalPool(data) {
  return request({
    url: '/recycle/capital-pool/create',
    method: 'post',
    data
  })
}

// 更新资金池
export function updateCapitalPool(data) {
  return request({
    url: '/recycle/capital-pool/update',
    method: 'put',
    data
  })
}

// 删除资金池
export function deleteCapitalPool(id) {
  return request({
    url: `/recycle/capital-pool/delete/${id}`,
    method: 'delete'
  })
}

// 获取资金池明细（根据资金池ID）
export function getCapitalPoolDetails(capitalPoolId) {
  return request({
    url: `/recycle/capital-pool/item/get/${capitalPoolId}`,
    method: 'get'
  })
}

