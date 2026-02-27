import request from '@/api/request'

// 获取文件分页列表
export function getFileListPage(params) {
  return request({
    url: '/system/file/page',
    method: 'get',
    params
  })
}

// 上传文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/system/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

