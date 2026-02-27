/**
 * 字典工具类
 * 提供字典数据的快速访问方法（缓存由后端负责）
 */

import { getDictItemsByTypeCode } from "@/api/dict"

export async function getDictData(typeCode) {
  try {
    const res = await getDictItemsByTypeCode(typeCode)
    if (res.code === 200 || res.code === 0) {
      return res.data || []
    }
    return []
  } catch (error) {
    console.error(`获取字典数据失败: ${typeCode}`, error)
    return []
  }
}

export async function getDictLabel(typeCode, value) {
  const items = await getDictData(typeCode)
  const item = items.find(i => String(i.value) === String(value))
  return item ? item.label : value
}

export async function getDictValue(typeCode, label) {
  const items = await getDictData(typeCode)
  const item = items.find(i => i.label === label)
  return item ? item.value : ""
}

export async function getDictMap(typeCode) {
  const items = await getDictData(typeCode)
  const map = new Map()
  items.forEach(item => {
    map.set(item.value, item)
  })
  return map
}

export async function getDictObject(typeCode) {
  const items = await getDictData(typeCode)
  const obj = {}
  items.forEach(item => {
    obj[item.value] = item
  })
  return obj
}

export function clearDictCache(typeCode) {
  console.warn("clearDictCache 已废弃：前端不再维护字典缓存，缓存由后端负责", typeCode)
}

export async function preloadDicts(typeCodes) {
  const promises = typeCodes.map(code => getDictData(code))
  await Promise.all(promises)
}

/**
 * Vue 插件：全局注入字典方法
 */
export default {
  install(app) {
    app.config.globalProperties.$getDictData = getDictData
    app.config.globalProperties.$getDictLabel = getDictLabel
    app.config.globalProperties.$getDictValue = getDictValue
    app.config.globalProperties.$getDictMap = getDictMap
    app.config.globalProperties.$getDictObject = getDictObject
    app.config.globalProperties.$clearDictCache = clearDictCache
  }
}

/**
 * Mixin：为组件提供字典数据
 */
export const dictMixin = {
  data() {
    return {
      dict: {}
    }
  },
  created() {
    this.loadDicts()
  },
  methods: {
    async loadDicts() {
      if (!this.$options.dicts || !Array.isArray(this.$options.dicts)) {
        return
      }

      const promises = this.$options.dicts.map(async typeCode => {
        const data = await getDictData(typeCode)
        this.dict[typeCode] = data
      })

      await Promise.all(promises)
    },
    async refreshDicts() {
      if (!this.$options.dicts || !Array.isArray(this.$options.dicts)) {
        return
      }

      const promises = this.$options.dicts.map(async typeCode => {
        const data = await getDictData(typeCode)
        this.dict[typeCode] = data
      })

      await Promise.all(promises)
    },
    getDictLabel(typeCode, value) {
      if (!this.dict[typeCode]) return value
      const item = this.dict[typeCode].find(i => String(i.value) === String(value))
      return item ? item.label : value
    },
    getDictValue(typeCode, label) {
      if (!this.dict[typeCode]) return ""
      const item = this.dict[typeCode].find(i => i.label === label)
      return item ? item.value : ""
    }
  }
}
