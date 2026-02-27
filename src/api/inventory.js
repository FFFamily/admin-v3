import request from '@/api/request'

// ==================== 仓库管理接口 ====================

/**
 * 创建仓库
 */
export function createWarehouse(data) {
  return request({
    url: '/inventory/warehouse/create',
    method: 'post',
    data
  })
}

/**
 * 更新仓库
 */
export function updateWarehouse(data) {
  return request({
    url: '/inventory/warehouse/update',
    method: 'put',
    data
  })
}

/**
 * 查询仓库详情
 */
export function getWarehouse(id) {
  return request({
    url: `/inventory/warehouse/get/${id}`,
    method: 'get'
  })
}

/**
 * 删除仓库
 */
export function deleteWarehouse(id) {
  return request({
    url: `/inventory/warehouse/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/停用仓库
 */
export function updateWarehouseStatus(data) {
  return request({
    url: '/inventory/warehouse/updateStatus',
    method: 'put',
    params: data
  })
}

/**
 * 分页查询仓库
 */
export function getWarehousePage(params) {
  return request({
    url: '/inventory/warehouse/page',
    method: 'get',
    params
  })
}

/**
 * 获取所有启用的仓库
 */
export function listActiveWarehouses() {
  return request({
    url: '/inventory/warehouse/listActive',
    method: 'get'
  })
}

// ==================== 库存查询接口 ====================

/**
 * 根据ID查询库存
 */
export function getInventory(id) {
  return request({
    url: `/inventory/get/${id}`,
    method: 'get'
  })
}

/**
 * 根据仓库和货物查询库存
 */
export function getInventoryByWarehouseAndGood(params) {
  return request({
    url: '/inventory/getByWarehouseAndGood',
    method: 'get',
    params
  })
}

/**
 * 分页查询库存
 */
export function getInventoryPage(data) {
  return request({
    url: '/inventory/page',
    method: 'post',
    data
  })
}

/**
 * 获取库存预警列表
 */
export function getInventoryWarning(params) {
  return request({
    url: '/inventory/warning',
    method: 'get',
    params
  })
}

/**
 * 库存统计
 */
export function getInventoryStatistics(params) {
  return request({
    url: '/inventory/statistics',
    method: 'get',
    params
  })
}

/**
 * 设置安全库存
 */
export function setMinStock(data) {
  return request({
    url: '/inventory/setMinStock',
    method: 'put',
    params: data
  })
}

/**
 * 锁定库存
 */
export function lockStock(data) {
  return request({
    url: '/inventory/lockStock',
    method: 'put',
    params: data
  })
}

/**
 * 解锁库存
 */
export function unlockStock(data) {
  return request({
    url: '/inventory/unlockStock',
    method: 'put',
    params: data
  })
}

// ==================== 入库管理接口 ====================

/**
 * 创建入库单
 */
export function createInbound(data) {
  return request({
    url: '/inventory/in/create',
    method: 'post',
    data
  })
}

/**
 * 查询入库单
 */
export function getInbound(id) {
  return request({
    url: `/inventory/in/get/${id}`,
    method: 'get'
  })
}

/**
 * 查询入库单明细
 */
export function getInboundItems(inId) {
  return request({
    url: `/inventory/in/items/${inId}`,
    method: 'get'
  })
}

/**
 * 确认入库
 */
export function confirmInbound(inId) {
  return request({
    url: `/inventory/in/confirm/${inId}`,
    method: 'put'
  })
}

/**
 * 取消入库单
 */
export function cancelInbound(inId) {
  return request({
    url: `/inventory/in/cancel/${inId}`,
    method: 'put'
  })
}

/**
 * 删除入库单
 */
export function deleteInbound(inId) {
  return request({
    url: `/inventory/in/delete/${inId}`,
    method: 'delete'
  })
}

/**
 * 分页查询入库单
 */
export function getInboundPage(params) {
  return request({
    url: '/inventory/in/page',
    method: 'get',
    params
  })
}

// ==================== 出库管理接口 ====================

/**
 * 创建出库单
 */
export function createOutbound(data) {
  return request({
    url: '/inventory/out/create',
    method: 'post',
    data
  })
}

/**
 * 查询出库单
 */
export function getOutbound(id) {
  return request({
    url: `/inventory/out/get/${id}`,
    method: 'get'
  })
}

/**
 * 查询出库单明细
 */
export function getOutboundItems(outId) {
  return request({
    url: `/inventory/out/items/${outId}`,
    method: 'get'
  })
}

/**
 * 确认出库
 */
export function confirmOutbound(outId) {
  return request({
    url: `/inventory/out/confirm/${outId}`,
    method: 'put'
  })
}

/**
 * 取消出库单
 */
export function cancelOutbound(outId) {
  return request({
    url: `/inventory/out/cancel/${outId}`,
    method: 'put'
  })
}

/**
 * 分页查询出库单
 */
export function getOutboundPage(params) {
  return request({
    url: '/inventory/out/page',
    method: 'get',
    params
  })
}

// ==================== 库存流水接口 ====================

/**
 * 查询库存流水
 */
export function getTransaction(id) {
  return request({
    url: `/inventory/transaction/get/${id}`,
    method: 'get'
  })
}

/**
 * 分页查询库存流水
 */
export function getTransactionPage(params) {
  return request({
    url: '/inventory/transaction/page',
    method: 'get',
    params
  })
}

// ==================== 库存报表接口 ====================

/**
 * 库存报表（按商品聚合）
 * 注意：接口路径以服务端实现为准，如不一致可在此处调整。
 */
export function getInventoryReportList(params) {
  return request({
    url: '/report/inventory/page',
    method: 'get',
    params
  })
}

/**
 * 导出库存报表
 */
export function exportInventoryReport(params) {
  return request({
    url: '/report/inventory/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 查询某个商品的库存明细
 */
export function getInventoryDetailList(goodNo) {
  return request({
    url: '/report/inventory/detail',
    method: 'get',
    params: { goodNo }
  })
}
