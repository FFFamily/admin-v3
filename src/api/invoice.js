import request from '@/api/request'

// 获取发票列表
export function getInvoicePage(params) {
  return request({
    url: '/recycle/invoice/page',
    method: 'get',
    data: params
  })
}

// 获取发票详情
export function getInvoiceDetail(id) {
  return request({
    url: `/recycle/invoice/get/${id}`,
    method: 'get'
  })
}

// 创建发票
export function createInvoice(data) {
  return request({
    url: '/recycle/invoice/create',
    method: 'post',
    data
  })
}

// 更新发票
export function updateInvoice(data) {
  return request({
    url: '/recycle/invoice/update',
    method: 'put',
    data
  })
}

// 删除发票
export function deleteInvoice(id) {
  return request({
    url: `/recycle/invoice/delete/${id}`,
    method: 'delete'
  })
}

// 确认发票
export function confirmInvoice(data) {
  return request({
    url: '/recycle/invoice/confirm',
    method: 'post',
    data
  })
}

// 批量创建发票
export function batchCreateInvoice(data) {
  return request({
    url: '/recycle/invoice/batch-create',
    method: 'post',
    data
  })
}

// 获取发票抬头分页列表
export function getInvoiceTitlePage(params) {
  return request({
    url: '/invoice-head/page',
    method: 'get',
    params
  })
}

// 创建发票抬头
export function createInvoiceTitle(data) {
  return request({
    url: '/invoice-head/create',
    method: 'post',
    data
  })
}

// 更新发票抬头
export function updateInvoiceTitle(data) {
  return request({
    url: '/invoice-head/update',
    method: 'put',
    data
  })
}

// 删除发票抬头
export function deleteInvoiceTitle(id) {
  return request({
    url: `/invoice-head/delete/${id}`,
    method: 'delete'
  })
}
