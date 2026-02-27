// 订单类型枚举
export const ORDER_TYPES = {
  PURCHASE: 'purchase',
  TRANSPORT: 'transport',
  PROCESS: 'process',
  SALES: 'sales',
  STORAGE: 'storage',
  OTHER: 'other'
}

// 订单类型选项
export const ORDER_TYPE_OPTIONS = [
  { label: '采购订单', value: ORDER_TYPES.PURCHASE },
  { label: '运输订单', value: ORDER_TYPES.TRANSPORT },
  { label: '加工订单', value: ORDER_TYPES.PROCESS },
  { label: '销售订单', value: ORDER_TYPES.SALES },
  { label: '仓储订单', value: ORDER_TYPES.STORAGE },
  { label: '其他订单', value: ORDER_TYPES.OTHER }
]

// 订单状态枚举
export const ORDER_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  UPLOADED: 'uploaded'
}

// 订单状态选项
export const ORDER_STATUS_OPTIONS = [
  { label: '执行中', value: ORDER_STATUS.PROCESSING },
  { label: '已结算', value: ORDER_STATUS.COMPLETED },
  { label: '已上传', value: ORDER_STATUS.UPLOADED }
]

// 流转方向枚举
export const FLOW_DIRECTION = {
  IN: 'IN',
  OUT: 'OUT'
}

// 流转方向选项
export const FLOW_DIRECTION_OPTIONS = [
  { label: '入库', value: FLOW_DIRECTION.IN },
  { label: '出库', value: FLOW_DIRECTION.OUT }
]

// 合作方枚举
export const CONTRACT_PARTNER = {
  PARTY_A: '甲方',
  PARTY_B: '乙方'
}

// 合作方选项
export const CONTRACT_PARTNER_OPTIONS = [
  { label: '甲方', value: CONTRACT_PARTNER.PARTY_A },
  { label: '乙方', value: CONTRACT_PARTNER.PARTY_B }
]

// 获取订单类型标签类型
export const ORDER_TYPE_TAG_TYPE = (type) => {
  const tagTypeMap = {
    [ORDER_TYPES.PURCHASE]: 'primary',
    [ORDER_TYPES.TRANSPORT]: 'warning',
    [ORDER_TYPES.PROCESS]: 'info',
    [ORDER_TYPES.SALES]: 'success',
    [ORDER_TYPES.STORAGE]: 'info',
    [ORDER_TYPES.OTHER]: 'info'
  }
  return tagTypeMap[type] || 'info'
}

// 获取订单状态标签类型
export function getOrderStatusTagType(status) {
  const tagTypeMap = {
    [ORDER_STATUS.PROCESSING]: 'warning',
    [ORDER_STATUS.COMPLETED]: 'success',
    [ORDER_STATUS.UPLOADED]: 'info'
  }
  return tagTypeMap[status] || 'info'
}

// 获取订单类型显示文本
export function getOrderTypeText(type) {
  const textMap = {
    [ORDER_TYPES.PURCHASE]: '采购订单',
    [ORDER_TYPES.TRANSPORT]: '运输订单',
    [ORDER_TYPES.PROCESS]: '加工订单',
    [ORDER_TYPES.SALES]: '销售订单',
    [ORDER_TYPES.STORAGE]: '仓储订单',
    [ORDER_TYPES.OTHER]: '其他订单'
  }
  return textMap[type] || '未知类型'
}

// 获取订单状态显示文本
export function getOrderStatusText(status) {
  const textMap = {
    [ORDER_STATUS.PROCESSING]: '执行中',
    [ORDER_STATUS.COMPLETED]: '已结算',
    [ORDER_STATUS.UPLOADED]: '已上传'
  }
  return textMap[status] || '未知状态'
}

// 获取流转方向显示文本
export function getFlowDirectionText(direction) {
  const textMap = {
    [FLOW_DIRECTION.IN]: '入库',
    [FLOW_DIRECTION.OUT]: '出库'
  }
  return textMap[direction] || '未知'
}
