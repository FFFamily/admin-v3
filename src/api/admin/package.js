import request from "@/api/request"

export function getPackagePage(params) {
  return request({
    url: "/admin/package/page",
    method: "get",
    params
  })
}

export function getAllPackages(params) {
  return request({
    url: "/admin/package/all",
    method: "get",
    params
  })
}

export function getPackageInfo(id) {
  return request({
    url: `/admin/package/${id}`,
    method: "get"
  })
}

export function createPackage(data) {
  return request({
    url: "/admin/package",
    method: "post",
    data
  })
}

export function updatePackage(data) {
  return request({
    url: "/admin/package",
    method: "put",
    data
  })
}

export function deletePackage(id) {
  return request({
    url: `/admin/package/${id}`,
    method: "delete"
  })
}

export function getPackagePermissionIds(id) {
  return request({
    url: `/admin/package/${id}/permission-ids`,
    method: "get"
  })
}

export function setPackagePermissionIds(id, permissionIds) {
  return request({
    url: `/admin/package/${id}/permission-ids`,
    method: "put",
    data: permissionIds || []
  })
}
