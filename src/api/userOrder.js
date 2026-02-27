import request from '@/api/request'

// 分页获取用户订单列表
export function getUserOrderListPage(params) {
  return request({
    url: '/recycle/user/order/page',
    method: 'get',
    params
  })
}

// 获取用户订单详情
export function getUserOrderDetail(params) {
  return request({
    url: '/recycle/user/order/detail/' + params.id,
    method: 'get'
  })
}

// 获取用户订单信息（包含各阶段订单信息）
export function getUserOrderInfo(id) {
  return request({
    url: '/recycle/user/order/info/' + id,
    method: 'get'
  })
}

// 创建用户订单
export function createUserOrder(data) {
  return request({
    url: '/recycle/user/order/create',
    method: 'post',
    data
  })
}

// 更新用户订单
export function updateUserOrder(data) {
  return request({
    url: '/recycle/user/order/update',
    method: 'put',
    data
  })
}

// 删除用户订单
export function deleteUserOrder(id) {
  return request({
    url: '/recycle/user/order/delete/' + id,
    method: 'delete'
  })
}

// 根据用户订单ID获取关联的回收订单
export function getRecycleOrderByParentId(parentId) {
  return request({
    url: `/recycle/order/parent/${parentId}`,
    method: 'get'
  })
}

// 结算用户订单
export function settleUserOrder(data) {
  return request({
    url: '/recycle/user/order/settle',
    method: 'post',
    data
  })
}

// 确认结算
export function confirmSettlement(data) {
  return request({
    url: '/recycle/user/order/confirmSettlement',
    method: 'post',
    data
  })
}

// 提交交付
export function submitDelivery(data) {
  return request({
    url: '/recycle/user/order/delivery',
    method: 'post',
    data
  })
}

// 保存补充材料
export function saveOrderMaterials(data) {
  return request({
    url: '/recycle/user/order/materials',
    method: 'post',
    data
  })
}

