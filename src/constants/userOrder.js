// 用户订单阶段枚举
export const USER_ORDER_STAGE = {
  PURCHASE: 'purchase',
  TRANSPORT: 'transport',
  PROCESSING: 'processing',
  WAREHOUSING: 'warehousing',
  PENDING_CUSTOMER_CONFIRMATION: 'pending_customer_confirmation',
  PENDING_SETTLEMENT: 'pending_settlement',
  COMPLETED: 'completed'
}

// 用户订单阶段选项
export const USER_ORDER_STAGE_OPTIONS = [
  { label: '采购', value: USER_ORDER_STAGE.PURCHASE },
  { label: '运输', value: USER_ORDER_STAGE.TRANSPORT },
  { label: '加工', value: USER_ORDER_STAGE.PROCESSING },
  { label: '入库', value: USER_ORDER_STAGE.WAREHOUSING },
  { label: '等待客户确认', value: USER_ORDER_STAGE.PENDING_CUSTOMER_CONFIRMATION },
  { label: '待结算', value: USER_ORDER_STAGE.PENDING_SETTLEMENT },
  { label: '完成', value: USER_ORDER_STAGE.COMPLETED }
]

// 用户订单状态枚举
export const USER_ORDER_STATUS = {
  WAIT_TRANSPORT: 'wait_transport',
  WAIT_SORTING: 'wait_sorting',
  WAIT_WAREHOUSING: 'wait_warehousing',
  COMPLETED: 'completed'
}

// 用户订单状态选项
export const USER_ORDER_STATUS_OPTIONS = [
  { label: '待运输', value: USER_ORDER_STATUS.WAIT_TRANSPORT },
  { label: '待分拣', value: USER_ORDER_STATUS.WAIT_SORTING },
  { label: '待入库', value: USER_ORDER_STATUS.WAIT_WAREHOUSING },
  { label: '已完成', value: USER_ORDER_STATUS.COMPLETED }
]

// 获取用户订单阶段显示文本
export function getUserOrderStageText(stage) {
  const textMap = {
    [USER_ORDER_STAGE.PURCHASE]: '采购',
    [USER_ORDER_STAGE.TRANSPORT]: '运输',
    [USER_ORDER_STAGE.PROCESSING]: '加工',
    [USER_ORDER_STAGE.WAREHOUSING]: '入库',
    [USER_ORDER_STAGE.PENDING_CUSTOMER_CONFIRMATION]: '等待客户确认',
    [USER_ORDER_STAGE.PENDING_SETTLEMENT]: '待结算',
    [USER_ORDER_STAGE.COMPLETED]: '完成'
  }
  return textMap[stage] || stage || '--'
}

// 获取用户订单阶段标签类型
export function getUserOrderStageTagType(stage) {
  const tagTypeMap = {
    [USER_ORDER_STAGE.PURCHASE]: 'warning',
    [USER_ORDER_STAGE.TRANSPORT]: 'primary',
    [USER_ORDER_STAGE.PROCESSING]: 'success',
    [USER_ORDER_STAGE.WAREHOUSING]: 'info',
    [USER_ORDER_STAGE.PENDING_CUSTOMER_CONFIRMATION]: 'warning',
    [USER_ORDER_STAGE.PENDING_SETTLEMENT]: 'warning',
    [USER_ORDER_STAGE.COMPLETED]: 'success'
  }
  return tagTypeMap[stage] || 'info'
}

// 获取用户订单状态显示文本
export function getUserOrderStatusText(status) {
  const textMap = {
    [USER_ORDER_STATUS.WAIT_TRANSPORT]: '待运输',
    [USER_ORDER_STATUS.WAIT_SORTING]: '待分拣',
    [USER_ORDER_STATUS.WAIT_WAREHOUSING]: '待入库',
    [USER_ORDER_STATUS.COMPLETED]: '已完成'
  }
  return textMap[status] || status || '--'
}

// 获取用户订单状态标签类型
export function getUserOrderStatusTagType(status) {
  const tagTypeMap = {
    [USER_ORDER_STATUS.WAIT_TRANSPORT]: 'warning',
    [USER_ORDER_STATUS.WAIT_SORTING]: 'warning',
    [USER_ORDER_STATUS.WAIT_WAREHOUSING]: 'warning',
    [USER_ORDER_STATUS.COMPLETED]: 'success'
  }
  return tagTypeMap[status] || 'info'
}

// 计价方式枚举
export const PRICING_METHOD = {
  SIMPLE: 'simple',
  GENERAL: 'general'
}

// 计价方式选项
export const PRICING_METHOD_OPTIONS = [
  { label: '简单计价', value: PRICING_METHOD.SIMPLE },
  { label: '一般计价', value: PRICING_METHOD.GENERAL }
]

// 获取计价方式显示文本
export function getPricingMethodText(method) {
  const textMap = {
    [PRICING_METHOD.SIMPLE]: '简单计价',
    [PRICING_METHOD.GENERAL]: '一般计价'
  }
  return textMap[method] || method || '--'
}

// 结算状态枚举
export const SETTLEMENT_STATUS = {
  NOT_SETTLED: 'not_settled',
  WAITING_CONFIRMATION: 'waiting_confirmation',
  SETTLED: 'settled',
  REJECTED: 'rejected',
  AUTO_SETTLED: 'auto_settled'
}

// 结算状态选项
export const SETTLEMENT_STATUS_OPTIONS = [
  { label: '未结算', value: SETTLEMENT_STATUS.NOT_SETTLED },
  { label: '待客户确认', value: SETTLEMENT_STATUS.WAITING_CONFIRMATION },
  { label: '已结算', value: SETTLEMENT_STATUS.SETTLED },
  { label: '已驳回', value: SETTLEMENT_STATUS.REJECTED },
  { label: '超时自动结算', value: SETTLEMENT_STATUS.AUTO_SETTLED }
]

// 获取结算状态显示文本
export function getSettlementStatusText(status) {
  const textMap = {
    [SETTLEMENT_STATUS.NOT_SETTLED]: '未结算',
    [SETTLEMENT_STATUS.WAITING_CONFIRMATION]: '待客户确认',
    [SETTLEMENT_STATUS.SETTLED]: '已结算',
    [SETTLEMENT_STATUS.REJECTED]: '已驳回',
    [SETTLEMENT_STATUS.AUTO_SETTLED]: '超时自动结算'
  }
  return textMap[status] || status || '--'
}

// 获取结算状态标签类型
export function getSettlementStatusTagType(status) {
  const tagTypeMap = {
    [SETTLEMENT_STATUS.NOT_SETTLED]: 'info',
    [SETTLEMENT_STATUS.WAITING_CONFIRMATION]: 'warning',
    [SETTLEMENT_STATUS.SETTLED]: 'success',
    [SETTLEMENT_STATUS.REJECTED]: 'danger',
    [SETTLEMENT_STATUS.AUTO_SETTLED]: 'success'
  }
  return tagTypeMap[status] || 'info'
}

// 交付状态枚举
export const DELIVERY_STATUS = {
  NOT_DELIVERED: 'not_delivered',
  DELIVERED: 'delivered',
  NO_NEED: 'no_need'
}

// 交付状态选项
export const DELIVERY_STATUS_OPTIONS = [
  { label: '未交付', value: DELIVERY_STATUS.NOT_DELIVERED },
  { label: '已交付', value: DELIVERY_STATUS.DELIVERED },
  { label: '无需交付', value: DELIVERY_STATUS.NO_NEED }
]

// 获取交付状态显示文本
export function getDeliveryStatusText(status) {
  const textMap = {
    [DELIVERY_STATUS.NOT_DELIVERED]: '未交付',
    [DELIVERY_STATUS.DELIVERED]: '已交付',
    [DELIVERY_STATUS.NO_NEED]: '无需交付'
  }
  return textMap[status] || status || '--'
}

// 获取交付状态标签类型
export function getDeliveryStatusTagType(status) {
  const tagTypeMap = {
    [DELIVERY_STATUS.NOT_DELIVERED]: 'warning',
    [DELIVERY_STATUS.DELIVERED]: 'success',
    [DELIVERY_STATUS.NO_NEED]: 'info'
  }
  return tagTypeMap[status] || 'info'
}

