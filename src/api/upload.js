import request from '@/api/request'

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
  }).then(r => {
    const baseUrl = import.meta.env.VITE_BASE_API || ''
    r.url = baseUrl + (r.fileUrl || '')
    return r
  })
}
