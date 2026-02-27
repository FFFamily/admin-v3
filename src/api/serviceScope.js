import request from '@/api/request'

// 查询服务范围列表（按服务商ID查询）
export function getServiceScopeList(accountId) {
  return request({
    url: `/account/service-provider/serviceScope/${accountId}`,
    method: 'get'
  })
}

// 新增服务范围
export function createServiceScope(data) {
  return request({
    url: '/account/service-provider/serviceScope',
    method: 'post',
    data
  })
}

// 更新服务范围
export function updateServiceScope(data) {
  return request({
    url: '/account/service-provider/serviceScope',
    method: 'put',
    data
  })
}

// 删除服务范围
export function deleteServiceScope(id) {
  return request({
    url: `/account/service-provider/serviceScope/${id}`,
    method: 'delete'
  })
}

// 批量更新服务范围
export function updateServiceScopeBatch(data) {
  return request({
    url: '/account/service-provider/updateServiceScope',
    method: 'put',
    data
  })
}


