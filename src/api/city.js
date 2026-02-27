import request from '@/api/request'

// 获取顶级城市（省份）
export function getTopLevelCities() {
  return request({
    url: '/system/city/children/0',
    method: 'get'
  })
}

// 根据父级代码获取子级城市
export function getChildrenCities(pCode) {
  return request({
    url: `/system/city/children/${pCode}`,
    method: 'get'
  })
}
