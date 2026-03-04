import request from "@/api/request"

export function getTenantPackages(tenantId) {
  return request({
    url: `/admin/tenant/${tenantId}/subscription/packages`,
    method: "get"
  })
}

// data: { packageId, startTimeMs?, endTimeMs? }  endTimeMs=null => 永久
export function grantTenantPackage(tenantId, data) {
  return request({
    url: `/admin/tenant/${tenantId}/subscription/grant-package`,
    method: "post",
    data
  })
}

export function changeTenantPackageStatus(tenantId, packageId, status) {
  return request({
    url: `/admin/tenant/${tenantId}/subscription/package/${packageId}/status`,
    method: "put",
    params: { status }
  })
}

export function getTenantEntitlementSnapshot(tenantId) {
  return request({
    url: `/admin/tenant/${tenantId}/subscription/entitlement-snapshot`,
    method: "get"
  })
}

