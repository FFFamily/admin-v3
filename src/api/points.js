import request from '@/api/request'

// 获取积分规则分页列表
export function getPointsRulePage(params) {
  return request({
    url: '/points/rule/page',
    method: 'get',
    params
  })
}

// 获取积分规则详情
export function getPointsRuleDetail(id) {
  return request({
    url: `/points/rule/${id}`,
    method: 'get'
  })
}

// 创建积分规则
export function createPointsRule(data) {
  return request({
    url: '/points/rule/create',
    method: 'post',
    data
  })
}

// 更新积分规则
export function updatePointsRule(data) {
  return request({
    url: '/points/rule/update',
    method: 'put',
    data
  })
}

// 删除积分规则
export function deletePointsRule(id) {
  return request({
    url: `/points/rule/${id}`,
    method: 'delete'
  })
}

// 获取用户积分明细分页列表
export function getPointsDetailPage(params) {
  return request({
    url: '/point/detail/page',
    method: 'get',
    params
  })
}

// 获取用户积分明细详情
export function getPointsDetailInfo(id) {
  return request({
    url: `/point/detail/${id}`,
    method: 'get'
  })
}

// 导出用户积分明细
export function exportPointsDetail(params) {
  return request({
    url: '/point/detail/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 积分调整（添加或减少积分）
export function adjustPoints(data) {
  return request({
    url: '/point/detail/create',
    method: 'post',
    data
  })
}

// ========== 积分配置管理 ==========
// 获取全局积分配置
export function getGlobalConfig() {
  return request({
    url: '/point/config/getGlobalConfig',
    method: 'get'
  })
}

// 更新全局积分配置
export function updateGlobalConfig(data) {
  return request({
    url: '/point/config/updateGlobalConfig',
    method: 'put',
    data
  })
}

// ========== 积分商品分类管理 ==========
// 获取积分商品分类分页列表
export function getPointsCategoryPage(params) {
  return request({
    url: '/point/goods-type/page',
    method: 'get',
    params
  })
}

// 获取积分商品分类详情
export function getPointsCategoryDetail(id) {
  return request({
    url: `/point/goods-type/${id}`,
    method: 'get'
  })
}

// 创建积分商品分类
export function createPointsCategory(data) {
  return request({
    url: '/point/goods-type/create',
    method: 'post',
    data
  })
}

// 更新积分商品分类
export function updatePointsCategory(data) {
  return request({
    url: '/point/goods-type/update',
    method: 'put',
    data
  })
}

// 删除积分商品分类
export function deletePointsCategory(id) {
  return request({
    url: `/point/goods-type/${id}`,
    method: 'delete'
  })
}

// ========== 积分商品管理 ==========
// 获取积分商品分页列表
export function getPointsGoodsPage(params) {
  return request({
    url: '/point/goods/page',
    method: 'get',
    params
  })
}

// 获取积分商品详情
export function getPointsGoodsDetail(id) {
  return request({
    url: `/point/goods/${id}`,
    method: 'get'
  })
}

// 创建积分商品
export function createPointsGoods(data) {
  return request({
    url: '/point/goods/create',
    method: 'post',
    data
  })
}

// 更新积分商品
export function updatePointsGoods(data) {
  return request({
    url: '/point/goods/update',
    method: 'put',
    data
  })
}

// 删除积分商品
export function deletePointsGoods(id) {
  return request({
    url: `/point/goods/${id}`,
    method: 'delete'
  })
}

// 上架/下架积分商品
export function changePointsGoodsStatus(id, status) {
  return request({
    url: `/point/goods/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// ========== 用户积分兑换管理 ==========
// 获取用户积分兑换记录分页列表
export function getPointsUseDetailPage(params) {
  return request({
    url: '/point/use-detail/page',
    method: 'get',
    params
  })
}

// 获取用户积分兑换记录详情
export function getPointsUseDetailInfo(id) {
  return request({
    url: `/point/use-detail/${id}`,
    method: 'get'
  })
}

// 创建用户积分兑换记录
export function createPointsUseDetail(data) {
  return request({
    url: '/point/use-detail/create',
    method: 'post',
    data
  })
}

// 确认使用积分兑换记录
export function confirmUsePoints(data) {
  return request({
    url: '/point/use-detail/use',
    method: 'put',
    data
  })
}

