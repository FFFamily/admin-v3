import request from '@/api/request'

// 分页查询资金走款
export function getFundFlowPage(params) {
  return request({
    url: '/recycle/fund/page',
    method: 'post',
    params
  })
}

// 获取资金走款详情
export function getFundFlowDetail(id) {
  return request({
    url: `/recycle/fund/${id}`,
    method: 'get'
  })
}

// 新增资金走款记录
export function addFundFlow(data) {
  return request({
    url: '/recycle/fund/add',
    method: 'post',
    data
  })
}

// 更新资金走款记录
export function updateFundFlow(data) {
  return request({
    url: '/recycle/fund/update',
    method: 'put',
    data
  })
}

// 提交确认资金走款
export function submitFundFlow(data) {
  return request({
    url: '/recycle/fund/confirm',
    method: 'post',
    data
  })
}

// 删除资金走款记录
export function deleteFundFlow(id) {
  return request({
    url: `/recycle/fund/delete/${id}`,
    method: 'delete'
  })
}

// 批量新增资金走款记录
export function batchAddFundFlow(data) {
  return request({
    url: '/recycle/fund/addBatch',
    method: 'post',
    data
  })
}

