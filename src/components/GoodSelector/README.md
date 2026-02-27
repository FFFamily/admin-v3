# GoodSelector 货物选择器

## 功能说明

货物选择器组件，用于在弹窗中选择一个或多个货物。支持搜索、分页、显示库存信息和单选/多选模式。

## 使用示例

```vue
<template>
  <div>
    <el-button @click="showGoodSelector">选择货物</el-button>
    
    <GoodSelector
      :visible.sync="goodSelectorVisible"
      title="选择货物"
      :multiple="true"
      :show-stock="true"
      :warehouse-id="selectedWarehouseId"
      @confirm="handleGoodSelected"
    />
  </div>
</template>

<script>
import GoodSelector from '@/components/GoodSelector'

export default {
  components: {
    GoodSelector
  },
  data() {
    return {
      goodSelectorVisible: false,
      selectedWarehouseId: ''
    }
  },
  methods: {
    showGoodSelector() {
      this.goodSelectorVisible = true
    },
    handleGoodSelected(goods) {
      console.log('选中的货物:', goods)
      // goods 是数组，单选时也是数组（只有一个元素）
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示弹窗 | Boolean | false |
| title | 弹窗标题 | String | '选择货物' |
| width | 弹窗宽度 | String | '1000px' |
| multiple | 是否多选模式 | Boolean | false |
| showPagination | 是否显示分页 | Boolean | true |
| showStock | 是否显示库存信息 | Boolean | true |
| warehouseId | 仓库ID（用于筛选特定仓库的库存） | String | '' |
| defaultSelected | 默认选中的货物数组 | Array | [] |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 点击确定时触发 | 选中的货物数组 |
| close | 关闭弹窗时触发 | - |
| update:visible | 弹窗显示状态变化时触发 | Boolean |

## 特性

- 支持按货物编号、名称、类型搜索
- 支持显示可用库存数量
- 库存数量用不同颜色标签展示（红色=0，黄色<10，绿色>=10）
- 支持单选和多选模式
- 支持分页加载
- 可按指定仓库筛选库存
- 已选择货物标签展示（多选模式）

