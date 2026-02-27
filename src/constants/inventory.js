// 仓库类型
export const WAREHOUSE_TYPE = {
  RAW_MATERIAL: 'raw_material',
  FINISHED_PRODUCT: 'finished_product',
  TRANSFER: 'transfer'
}

export const WAREHOUSE_TYPE_OPTIONS = [
  { value: 'raw_material', label: '原料仓' },
  { value: 'finished_product', label: '成品仓' },
  { value: 'transfer', label: '中转仓' }
]

export const WAREHOUSE_TYPE_MAP = {
  raw_material: '原料仓',
  finished_product: '成品仓',
  transfer: '中转仓'
}

// 仓库状态
export const WAREHOUSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

export const WAREHOUSE_STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' }
]

export const WAREHOUSE_STATUS_MAP = {
  active: '启用',
  inactive: '停用'
}

// 入库类型
export const INBOUND_TYPE = {
  PURCHASE: 'purchase',
  RETURN: 'return',
  TRANSFER: 'transfer',
  OTHER: 'other'
}

export const INBOUND_TYPE_OPTIONS = [
  { value: 'purchase', label: '采购入库' },
  { value: 'return', label: '退货入库' },
  { value: 'transfer', label: '调拨入库' },
  { value: 'other', label: '其他入库' }
]

export const INBOUND_TYPE_MAP = {
  purchase: '采购入库',
  return: '退货入库',
  transfer: '调拨入库',
  other: '其他入库'
}

// 出库类型
export const OUTBOUND_TYPE = {
  SALE: 'sale',
  DAMAGE: 'damage',
  TRANSFER: 'transfer',
  OTHER: 'other'
}

export const OUTBOUND_TYPE_OPTIONS = [
  { value: 'sale', label: '销售出库' },
  { value: 'damage', label: '报损出库' },
  { value: 'transfer', label: '调拨出库' },
  { value: 'other', label: '其他出库' }
]

export const OUTBOUND_TYPE_MAP = {
  sale: '销售出库',
  damage: '报损出库',
  transfer: '调拨出库',
  other: '其他出库'
}

// 出入库单据状态
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
}

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: '待处理' },
  { value: 'confirmed', label: '已确认' },
  { value: 'cancelled', label: '已取消' }
]

export const ORDER_STATUS_MAP = {
  pending: '待处理',
  confirmed: '已确认',
  cancelled: '已取消'
}

// 交易类型
export const TRANSACTION_TYPE = {
  IN: 'in',
  OUT: 'out',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  ADJUST: 'adjust'
}

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'in', label: '入库' },
  { value: 'out', label: '出库' },
  { value: 'lock', label: '锁定' },
  { value: 'unlock', label: '解锁' },
  { value: 'adjust', label: '调整' }
]

export const TRANSACTION_TYPE_MAP = {
  in: '入库',
  out: '出库',
  lock: '锁定',
  unlock: '解锁',
  adjust: '调整'
}

// 业务类型（对应入库/出库类型）
export const BUSINESS_TYPE_MAP = {
  purchase: '采购',
  return: '退货',
  sale: '销售',
  damage: '报损',
  transfer: '调拨',
  other: '其他'
}

