// 积分类型枚举
export const POINTS_CHANGE_TYPE = {
  SIGN_IN: 'sign_in', // 签到
  ORDER_INCOME: 'order_income', // 订单收入
  ORDER_EXPENSE: 'order_expense', // 订单支出
  ACTIVITY_REWARD: 'activity_reward', // 活动奖励
  SYSTEM_ADJUST: 'system_adjust', // 系统调整
  SYSTEM_REWARD: 'system_reward' // 系统奖励
}

// 积分类型选项
export const POINTS_CHANGE_TYPE_OPTIONS = [
  { label: '签到', value: POINTS_CHANGE_TYPE.SIGN_IN },
  { label: '订单收入', value: POINTS_CHANGE_TYPE.ORDER_INCOME },
  { label: '订单支出', value: POINTS_CHANGE_TYPE.ORDER_EXPENSE },
  { label: '活动奖励', value: POINTS_CHANGE_TYPE.ACTIVITY_REWARD },
  { label: '系统调整', value: POINTS_CHANGE_TYPE.SYSTEM_ADJUST },
  { label: '系统奖励', value: POINTS_CHANGE_TYPE.SYSTEM_REWARD }
]

// 获取积分类型显示文本
export function getPointsChangeTypeText(type) {
  const textMap = {
    [POINTS_CHANGE_TYPE.SIGN_IN]: '签到',
    [POINTS_CHANGE_TYPE.ORDER_INCOME]: '订单收入',
    [POINTS_CHANGE_TYPE.ORDER_EXPENSE]: '订单支出',
    [POINTS_CHANGE_TYPE.ACTIVITY_REWARD]: '活动奖励',
    [POINTS_CHANGE_TYPE.SYSTEM_ADJUST]: '系统调整',
    [POINTS_CHANGE_TYPE.SYSTEM_REWARD]: '系统奖励'
  }
  return textMap[type] || type || '--'
}

