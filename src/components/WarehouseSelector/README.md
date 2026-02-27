# WarehouseSelector 仓库选择器

## 功能说明

仓库选择器组件，用于在弹窗中选择一个或多个仓库。支持搜索、分页和单选/多选模式。

## 使用示例

```vue
<template>
  <div>
    <el-button @click="showWarehouseSelector">选择仓库</el-button>
    
    <WarehouseSelector
      :visible.sync="warehouseSelectorVisible"
      title="选择仓库"
      :multiple="false"
      :active-only="true"
      @confirm="handleWarehouseSelected"
    />
  </div>
</template>

<script>
import WarehouseSelector from '@/components/WarehouseSelector'

export default {
  components: {
    WarehouseSelector
  },
  data() {
    return {
      warehouseSelectorVisible: false
    }
  },
  methods: {
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },
    handleWarehouseSelected(warehouses) {
      console.log('选中的仓库:', warehouses)
      // warehouses 是数组，单选时也是数组（只有一个元素）
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示弹窗 | Boolean | false |
| title | 弹窗标题 | String | '选择仓库' |
| width | 弹窗宽度 | String | '900px' |
| multiple | 是否多选模式 | Boolean | false |
| showPagination | 是否显示分页 | Boolean | true |
| activeOnly | 是否只显示启用的仓库 | Boolean | false |
| defaultSelected | 默认选中的仓库数组 | Array | [] |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 点击确定时触发 | 选中的仓库数组 |
| close | 关闭弹窗时触发 | - |
| update:visible | 弹窗显示状态变化时触发 | Boolean |

## 特性

- 支持按仓库名称、编号搜索
- 支持按状态筛选（启用/停用）
- 支持单选和多选模式
- 支持分页加载
- 可设置只显示启用的仓库
- 已选择仓库标签展示（多选模式）

