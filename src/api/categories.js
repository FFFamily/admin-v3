import request from '@/api/request'

// 获取商品分类列表
export function getCategoryList(params) {
  return request({
    url: '/lease/good/category/list',
    method: 'get',
    params
  })
}

// 保存商品分类(新增或编辑)
export function saveCategory(data) {
  return request({
    url: '/lease/good/category/create',
    method: 'post',
    data
  })
}

// 删除商品分类
export function deleteCategory(id) {
  return request({
    url: `/lease/good/category/delete/${id}`,
    method: 'delete'
  })
}

// 获取所有分类(用于级联选择)
export function getAllCategories() {
  return request({
    url: '/lease/good/category/all',
    method: 'get'
  })
}
