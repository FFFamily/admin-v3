// 合同类型枚举
export const CONTRACT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  TRANSPORT: 'transport',
  PROCESS: 'process',
  STORAGE: 'storage',
  OTHER: 'other'
}

// 合同类型选项
export const CONTRACT_TYPE_OPTIONS = [
  { label: '采购合同', value: CONTRACT_TYPES.PURCHASE },
  { label: '销售合同', value: CONTRACT_TYPES.SALE },
  { label: '运输合同', value: CONTRACT_TYPES.TRANSPORT },
  { label: '加工合同', value: CONTRACT_TYPES.PROCESS },
  { label: '仓储合同', value: CONTRACT_TYPES.STORAGE },
  { label: '其他合同', value: CONTRACT_TYPES.OTHER }
]

// 合同状态枚举
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated'
}

// 合同状态选项
export const CONTRACT_STATUS_OPTIONS = [
  { label: '草稿', value: CONTRACT_STATUS.DRAFT },
  { label: '生效中', value: CONTRACT_STATUS.ACTIVE },
  { label: '已过期', value: CONTRACT_STATUS.EXPIRED },
  { label: '已终止', value: CONTRACT_STATUS.TERMINATED }
]

// 获取合同类型标签类型
export function getContractTypeTagType(type) {
  const tagTypeMap = {
    [CONTRACT_TYPES.PURCHASE]: 'primary',
    [CONTRACT_TYPES.SALE]: 'success',
    [CONTRACT_TYPES.TRANSPORT]: 'warning',
    [CONTRACT_TYPES.PROCESS]: 'info',
    [CONTRACT_TYPES.STORAGE]: 'info',
    [CONTRACT_TYPES.OTHER]: 'info'
  }
  return tagTypeMap[type] || 'info'
}

// 获取合同类型标签颜色
export function getContractTypeTagColor(type) {
  const colorMap = {
    [CONTRACT_TYPES.PURCHASE]: 'red',
    [CONTRACT_TYPES.SALE]: 'green',
    [CONTRACT_TYPES.TRANSPORT]: 'orange',
    [CONTRACT_TYPES.PROCESS]: 'blue',
    [CONTRACT_TYPES.STORAGE]: 'purple',
    [CONTRACT_TYPES.OTHER]: 'gray'
  }
  return colorMap[type] || 'red'
}

// 获取合同状态标签类型
export function getContractStatusTagType(status) {
  const tagTypeMap = {
    [CONTRACT_STATUS.DRAFT]: 'info',
    [CONTRACT_STATUS.ACTIVE]: 'success',
    [CONTRACT_STATUS.EXPIRED]: 'warning',
    [CONTRACT_STATUS.TERMINATED]: 'danger'
  }
  return tagTypeMap[status] || 'info'
}

// 获取合同类型显示文本
export function getContractTypeText(type) {
  const textMap = {
    [CONTRACT_TYPES.PURCHASE]: '采购合同',
    [CONTRACT_TYPES.SALE]: '销售合同',
    [CONTRACT_TYPES.TRANSPORT]: '运输合同',
    [CONTRACT_TYPES.PROCESS]: '加工合同',
    [CONTRACT_TYPES.STORAGE]: '仓储合同',
    [CONTRACT_TYPES.OTHER]: '其他合同'
  }
  return textMap[type] || '未知类型'
}

// 获取合同状态显示文本
export function getContractStatusText(status) {
  const textMap = {
    [CONTRACT_STATUS.DRAFT]: '草稿',
    [CONTRACT_STATUS.ACTIVE]: '生效中',
    [CONTRACT_STATUS.EXPIRED]: '已过期',
    [CONTRACT_STATUS.TERMINATED]: '已终止'
  }
  return textMap[status] || '未知状态'
}

