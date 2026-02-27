import request from "@/api/request"

// 部门分页列表
export function getDepartmentPage(params) {
  return request({
    url: "/admin/department/page",
    method: "get",
    params
  })
}

// 部门树
export function getDepartmentTree() {
  return request({
    url: "/admin/department/tree",
    method: "get"
  })
}

// 全部启用部门（下拉）
export function getAllEnabledDepartments() {
  return request({
    url: "/admin/department/all",
    method: "get"
  })
}

// 创建部门
export function createDepartment(data) {
  return request({
    url: "/admin/department",
    method: "post",
    data
  })
}

// 更新部门
export function updateDepartment(data) {
  return request({
    url: "/admin/department",
    method: "put",
    data
  })
}

// 删除部门
export function deleteDepartment(id) {
  return request({
    url: `/admin/department/${id}`,
    method: "delete"
  })
}

// 批量删除部门
export function batchDeleteDepartments(ids) {
  return request({
    url: "/admin/department/batch",
    method: "delete",
    data: ids
  })
}

