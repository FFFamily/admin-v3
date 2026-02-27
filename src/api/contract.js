import request from '@/api/request'

export function getContractList(params) {
  return request({
    url: '/sys/contract/list',
    method: 'get',
    params
  })
}
export function getContractPage(params) {
  return request({
    url: '/sys/contract/page',
    method: 'get',
    params
  })
}

export function getContractDetail(id) {
  return request({
    url: `/sys/contract/${id}`,
    method: 'get'
  })
}
export function addContract(data) {
  return request({
    url: '/sys/contract',
    method: 'post',
    data
  })
}
// 更新合同
export function updateContract(data) {
  return request({
    url: `/sys/contract/update`,
    method: 'put',
    data
  })
}
export function deleteContract(id) {
  return request({
    url: `/sys/contract/${id}`,
    method: 'delete'
  })
}

export function getContractItems(contractId) {
  return request({
    url: `/system/contract-item/list/contract/${contractId}`,
    method: 'get'
  })
}

// 获取合同日志列表
export function getContractLogList(contractId) {
  return request({
    url: `/system/contract/log/list/${contractId}`,
    method: 'get'
  })
}
