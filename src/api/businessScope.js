import request from '@/api/request'

// 获取经营范围分页列表
export function getBusinessScopePage(params) {
  return request({
    url: '/recycle/business-scope/page',
    method: 'get',
    params
  })
}

// 获取经营范围详情
export function getBusinessScopeDetail(id) {
  return request({
    url: `/recycle/business-scope/${id}`,
    method: 'get'
  })
}

// 新增经营范围
export function createBusinessScope(data) {
  return request({
    url: '/recycle/business-scope/create',
    method: 'post',
    data
  })
}

// 更新经营范围
export function updateBusinessScope(id, data) {
  return request({
    url: `/recycle/business-scope/update`,
    method: 'put',
    data
  })
}

// 删除经营范围
export function deleteBusinessScope(id) {
  return request({
    url: `/recycle/business-scope/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除经营范围
export function batchDeleteBusinessScope(ids) {
  return request({
    url: '/recycle/business-scope/delete/batch',
    method: 'delete',
    data: ids
  })
}
// 更新是否显示
export function updateBusinessScopeVisible(id, isShow) {
  return request({
    url: `/recycle/business-scope/update/isShow`,
    method: 'put',
    data: { id, isShow }
  })
}

// 上移
export function moveUpBusinessScope(id) {
  return request({
    url: `/recycle/business-scope/move-up/${id}`,
    method: 'put'
  })
}

// 下移
export function moveDownBusinessScope(id) {
  return request({
    url: `/recycle/business-scope/move-down/${id}`,
    method: 'put'
  })
}
