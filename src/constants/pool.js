
// 资金池方向枚举
export const FUND_POOL_DIRECTION = [
  {
    label: '收款',
    value: '0'
  },
  {
    label: '付款',
    value: '1'
  }
]

// 获取资金池方向名称
export const getFundPoolDirectionName = (value) => {
  const item = FUND_POOL_DIRECTION.find(item => item.value === value)
  return item ? item.label : ''
}
