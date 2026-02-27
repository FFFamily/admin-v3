import request from '@/api/request'

// 获取首页配置
export function getHomeConfig() {
  return request({
    url: '/system/home/config',
    method: 'get'
  })
}

export function getWxHomeConfig() {
  return request({
    url: '/system/home/config/wx',
    method: 'get'
  })
}

// 更新首页配置
export function updateHomeConfig(id, data) {
  return request({
    url: `/system/home/config/update/${id}`,
    method: 'put',
    data
  })
}
