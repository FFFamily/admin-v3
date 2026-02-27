import request from '@/api/request'

/**
 * 获取追溯链数据
 * @param {string} orderId - 订单ID
 * @returns {Promise}
 */
export function getTraceabilityChain(orderId) {
  return request({
    url: `/recycle/order/trace/${orderId}`,
    method: 'get'
  })
}

