// 租赁商品 接口
import request from '@/api/request'
// 分页获取租赁商品列表
export function getLeaseGoodListPage(pageParam, searchParam) {
  return request({
    url: '/lease/good/page',
    method: 'get',
    params: {
      ...pageParam,
      ...searchParam
    }
  })
}
// 改变商品状态
export function changeGoodStatus(goodId, status) {
  return request({
    url: '/lease/good/changeStatus',
    method: 'put',
    params: {
      goodId,
      status
    }
  })
}
// 手动根据商品创建订单
export function createLeaseOrder(data) {
  return request({
    url: '/lease/order/create/fromGood',
    method: 'post',
    data
  })
}
export function getLeaseGoodDetail(params) {
  return request({
    url: '/lease/good/detail',
    method: 'get',
    params
  })
}
export function addLeaseGood(data) {
  return request({
    url: '/lease/good/create',
    method: 'post',
    data
  })
}

export function updateLeaseGood(data) {
  return request({
    url: '/lease/good/update',
    method: 'put',
    data
  })
}
export function deleteLeaseGood(id) {
  return request({
    url: `/lease/good/delete/${id}`,
    method: 'delete'
  })
}
// 获取商品分类列表
export function getCategoriesList(params) {
  return request({
    url: '/lease/good/category/list',
    method: 'get',
    params
  })
}
// 分页获取商品分类列表
export function getCategoriesListPage(params) {
  return request({
    url: '/lease/good/category/page',
    method: 'get',
    params
  })
}
// 保存商品分类(新增或编辑)
export function saveCategory(data) {
  return request({
    url: '/lease/good/category/create',
    method: 'post',
    data
  })
}
// 删除商品分类
export function deleteCategory(id) {
  return request({
    url: `/lease/good/category/delete/${id}`,
    method: 'delete'
  })
}
// 更新商品分类
export function updateCategory(data) {
  return request({
    url: '/lease/good/category/update',
    method: 'put',
    data
  })
}

