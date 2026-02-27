import request from '@/api/request'

// 获取合同回收分页列表
export function getRecycleContractPage(params) {
  return request({
    url: '/recycle/contract/page',
    method: 'get',
    params
  })
}
// 根据合同编号获取合同
export function getContractByNo(contractNo) {
  return request({
    url: `/recycle/contract/getByNo/${contractNo}`,
    method: 'get'
  })
}

// 获取合同回收详情
export function getRecycleContractDetail(id) {
  return request({
    url: `/recycle/contract/${id}`,
    method: 'get'
  })
}

// 创建合同回收
export function createRecycleContract(data) {
  return request({
    url: '/recycle/contract/create',
    method: 'post',
    data
  })
}

// 更新合同回收
export function updateRecycleContract(data) {
  return request({
    url: `/recycle/contract/update`,
    method: 'put',
    data
  })
}

// 删除合同回收
export function deleteRecycleContract(id) {
  return request({
    url: `/recycle/contract-item/${id}`,
    method: 'delete'
  })
}

// 获取合同货物明细列表
export function getContractItems(contractId) {
  return request({
    url: `/recycle/contract-item/get/${contractId}`,
    method: 'get'
  })
}

// 创建合同货物明细
export function createContractItem(data) {
  return request({
    url: '/recycle/contract-item/create',
    method: 'post',
    data
  })
}

// 更新合同货物明细
export function updateContractItem(data) {
  return request({
    url: `/recycle/contract-item/update`,
    method: 'put',
    data
  })
}

// 删除合同货物明细
export function deleteContractItem(id) {
  return request({
    url: `/recycle/contract-item/delete/${id}`,
    method: 'delete'
  })
}

// 导出合同回收数据
export function exportRecycleContract(params) {
  return request({
    url: '/recycle/contract/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
