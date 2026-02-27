import request from "@/api/request"

/**
 * 字典管理 API
 */

// ==================== 字典类型相关 ====================

export function getDictTypeList(params) {
  return request({
    url: "/system/dict/type/all",
    method: "get",
    params
  })
}

export function createDictType(data) {
  return request({
    url: "/system/dict/type/create",
    method: "post",
    data
  })
}

export function updateDictType(data) {
  return request({
    url: "/system/dict/type/update",
    method: "put",
    data
  })
}

export function deleteDictType(id) {
  return request({
    url: `/system/dict/type/delete/${id}`,
    method: "delete"
  })
}

export function getDictTypeById(id) {
  return request({
    url: `/system/dict/type/${id}`,
    method: "get"
  })
}

// ==================== 字典项相关 ====================

export function getDictItemPage(params) {
  return request({
    url: "/system/dict/data/page",
    method: "get",
    params
  })
}

export function getDictItemsByTypeCode(typeCode) {
  return request({
    url: `/system/dict/data/type/${typeCode}`,
    method: "get"
  })
}

export function createDictItem(data) {
  return request({
    url: "/system/dict/data/create",
    method: "post",
    data
  })
}

export function updateDictItem(data) {
  return request({
    url: "/system/dict/data/update",
    method: "put",
    data
  })
}

export function deleteDictItem(id) {
  return request({
    url: `/system/dict/data/delete/${id}`,
    method: "delete"
  })
}

export function getDictItemById(id) {
  return request({
    url: `/system/dict/data/${id}`,
    method: "get"
  })
}

export function batchDeleteDictItems(ids) {
  return request({
    url: "/system/dict/data/batch/delete",
    method: "delete",
    data: { ids }
  })
}

export function updateDictItemSort(data) {
  return request({
    url: "/system/dict/data/sort/update",
    method: "put",
    data
  })
}
