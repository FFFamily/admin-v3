import request from '@/api/request'

// 获取站点分页列表
export function getSiteListPage(params) {
  return request({
    url: '/recycle/site/page',
    method: 'get',
    params
  })
}

// 创建站点
export function createSite(data) {
  return request({
    url: '/recycle/site/create',
    method: 'post',
    data
  })
}

// 更新站点
export function updateSite(data) {
  return request({
    url: '/recycle/site/update',
    method: 'put',
    data
  })
}

// 删除站点
export function deleteSite(id) {
  return request({
    url: `/recycle/site/delete/${id}`,
    method: 'delete'
  })
}

// 获取所有站点列表（用于选择器）
export function getSiteList() {
  return request({
    url: '/recycle/site/list',
    method: 'get'
  })
}
