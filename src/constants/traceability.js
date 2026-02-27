// 货物流转步骤枚举
export const FLOW_STEPS = {
  PURCHASE: 'purchase', // 采购
  TRANSPORT: 'transport', // 运输
  PROCESS: 'process', // 加工
  STORAGE: 'storage', // 仓储
  SALES: 'sales' // 销售
}

// 流转步骤选项
export const FLOW_STEP_OPTIONS = [
  { label: '采购', value: FLOW_STEPS.PURCHASE, order: 1 },
  { label: '运输', value: FLOW_STEPS.TRANSPORT, order: 2 },
  { label: '加工', value: FLOW_STEPS.PROCESS, order: 3 },
  { label: '仓储', value: FLOW_STEPS.STORAGE, order: 4 },
  { label: '销售', value: FLOW_STEPS.SALES, order: 5 }
]

// 识别码变更原因枚举
export const IDENTIFY_CODE_CHANGE_REASONS = {
  INITIAL: 'initial', // 初始创建
  MERGE: 'merge', // 合并批次
  SPLIT: 'split', // 分拆批次
  REPROCESS: 'reprocess', // 重新加工
  REPACKAGE: 'repackage', // 重新包装
  QUALITY_CHANGE: 'quality_change', // 品质变化
  CATEGORY_CHANGE: 'category_change', // 分类变化
  OTHER: 'other' // 其他原因
}

// 识别码变更原因选项
export const IDENTIFY_CODE_CHANGE_REASON_OPTIONS = [
  { label: '初始创建', value: IDENTIFY_CODE_CHANGE_REASONS.INITIAL },
  { label: '合并批次', value: IDENTIFY_CODE_CHANGE_REASONS.MERGE },
  { label: '分拆批次', value: IDENTIFY_CODE_CHANGE_REASONS.SPLIT },
  { label: '重新加工', value: IDENTIFY_CODE_CHANGE_REASONS.REPROCESS },
  { label: '重新包装', value: IDENTIFY_CODE_CHANGE_REASONS.REPACKAGE },
  { label: '品质变化', value: IDENTIFY_CODE_CHANGE_REASONS.QUALITY_CHANGE },
  { label: '分类变化', value: IDENTIFY_CODE_CHANGE_REASONS.CATEGORY_CHANGE },
  { label: '其他原因', value: IDENTIFY_CODE_CHANGE_REASONS.OTHER }
]

// 货物状态枚举
export const GOODS_STATUS = {
  IN_STOCK: 'in_stock', // 在库
  IN_TRANSIT: 'in_transit', // 在途
  PROCESSING: 'processing', // 加工中
  COMPLETED: 'completed', // 已完成
  SOLD: 'sold' // 已销售
}

// 货物状态选项
export const GOODS_STATUS_OPTIONS = [
  { label: '在库', value: GOODS_STATUS.IN_STOCK },
  { label: '在途', value: GOODS_STATUS.IN_TRANSIT },
  { label: '加工中', value: GOODS_STATUS.PROCESSING },
  { label: '已完成', value: GOODS_STATUS.COMPLETED },
  { label: '已销售', value: GOODS_STATUS.SOLD }
]

// 获取流转步骤显示文本
export function getFlowStepText(step) {
  const textMap = {
    [FLOW_STEPS.PURCHASE]: '采购',
    [FLOW_STEPS.TRANSPORT]: '运输',
    [FLOW_STEPS.PROCESS]: '加工',
    [FLOW_STEPS.STORAGE]: '仓储',
    [FLOW_STEPS.SALES]: '销售',
    'current': '当前订单'
  }
  return textMap[step] || '未知步骤'
}

// 获取识别码变更原因显示文本
export function getChangeReasonText(reason) {
  const textMap = {
    [IDENTIFY_CODE_CHANGE_REASONS.INITIAL]: '初始创建',
    [IDENTIFY_CODE_CHANGE_REASONS.MERGE]: '合并批次',
    [IDENTIFY_CODE_CHANGE_REASONS.SPLIT]: '分拆批次',
    [IDENTIFY_CODE_CHANGE_REASONS.REPROCESS]: '重新加工',
    [IDENTIFY_CODE_CHANGE_REASONS.REPACKAGE]: '重新包装',
    [IDENTIFY_CODE_CHANGE_REASONS.QUALITY_CHANGE]: '品质变化',
    [IDENTIFY_CODE_CHANGE_REASONS.CATEGORY_CHANGE]: '分类变化',
    [IDENTIFY_CODE_CHANGE_REASONS.OTHER]: '其他原因',
    'trace_relation': '追溯关联'
  }
  return textMap[reason] || '未知原因'
}

// 获取货物状态显示文本
export function getGoodsStatusText(status) {
  const textMap = {
    [GOODS_STATUS.IN_STOCK]: '在库',
    [GOODS_STATUS.IN_TRANSIT]: '在途',
    [GOODS_STATUS.PROCESSING]: '加工中',
    [GOODS_STATUS.COMPLETED]: '已完成',
    [GOODS_STATUS.SOLD]: '已销售'
  }
  return textMap[status] || '未知状态'
}

// 生成识别码
export function generateIdentifyCode(step, timestamp = Date.now()) {
  const stepPrefix = {
    [FLOW_STEPS.PURCHASE]: 'PUR',
    [FLOW_STEPS.TRANSPORT]: 'TRA',
    [FLOW_STEPS.PROCESS]: 'PRO',
    [FLOW_STEPS.STORAGE]: 'STO',
    [FLOW_STEPS.SALES]: 'SAL'
  }

  const prefix = stepPrefix[step] || 'UNK'
  const dateStr = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()

  return `${prefix}${dateStr}${randomStr}`
}
