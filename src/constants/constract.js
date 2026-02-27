export const getStatusText = (startTime, endTime) => {
  const now = new Date()
  // 如果当前时间在起始时间之前，则状态为未生效
  if (now < new Date(startTime)) {
    return '未生效'
  }
  // 如果当前时间在结束时间之后，则状态为已终止
  if (now > new Date(endTime)) {
    return '已终止'
  }
  // 如果（结束日期 - 当前日期）小于7天
  if (new Date(endTime) - now < 7 * 24 * 60 * 60 * 1000) {
    return '临期'
  }
  // 如果当前时间在起始时间之后，结束时间之前，则状态为执行中
  return '执行中'
}

export const getStatusType = (startTime, endTime) => {
  const status = getStatusText(startTime, endTime)
  const statusTypeMap = {
    '未生效': 'info',
    '执行中': 'primary',
    '临期': 'success',
    '已终止': 'danger'
  }
  return statusTypeMap[status]
}

