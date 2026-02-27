# 订单选择器组件 (OrderSelector)

一个可复用的订单选择器组件，支持单选和多选模式，提供搜索、分页等功能。

## 功能特性

- 支持单选和多选模式
- 提供订单搜索功能（按类型、状态、编号、识别码、合作方等）
- 支持分页显示
- 可配置是否显示流转方向列
- 支持外部过滤条件
- 响应式设计

## 使用方法

### 基本用法

```vue
<template>
  <div>
    <!-- 单选模式 -->
    <el-button @click="openSingleSelector">选择订单</el-button>
    
    <!-- 多选模式 -->
    <el-button @click="openMultipleSelector">批量选择订单</el-button>
    
    <!-- 订单选择器 -->
    <order-selector
      :visible.sync="selectorVisible"
      :title="selectorTitle"
      :multiple="isMultiple"
      :selected-orders="selectedOrders"
      :show-flow-direction="true"
      :filters="filterConditions"
      @confirm="handleOrderSelected"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import OrderSelector from '@/components/OrderSelector'

export default {
  components: {
    OrderSelector
  },
  data() {
    return {
      selectorVisible: false,
      selectorTitle: '选择订单',
      isMultiple: false,
      selectedOrders: [],
      filterConditions: {
        type: 'purchase', // 只显示采购订单
        status: 'processing' // 只显示执行中的订单
      }
    }
  },
  methods: {
    openSingleSelector() {
      this.isMultiple = false
      this.selectorTitle = '选择订单'
      this.selectorVisible = true
    },
    
    openMultipleSelector() {
      this.isMultiple = true
      this.selectorTitle = '批量选择订单'
      this.selectorVisible = true
    },
    
    handleOrderSelected(orders) {
      this.selectedOrders = orders
      console.log('选中的订单:', orders)
    },
    
    handleCancel() {
      console.log('取消选择')
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visible | 是否显示弹窗 | Boolean | - | false |
| title | 弹窗标题 | String | - | '选择订单' |
| multiple | 是否多选模式 | Boolean | - | false |
| selectedOrders | 已选中的订单 | Array | - | [] |
| showFlowDirection | 是否显示流转方向列 | Boolean | - | false |
| filters | 外部过滤条件 | Object | - | {} |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认选择时触发 | (selectedOrders: Array) |
| cancel | 取消选择时触发 | - |
| update:visible | 弹窗显示状态变化时触发 | (visible: Boolean) |

## 过滤条件示例

```javascript
// 只显示特定类型的订单
const filters = {
  type: 'purchase', // 采购订单
  status: 'processing' // 执行中状态
}

// 只显示特定合作方的订单
const filters = {
  contractPartnerName: '某某公司'
}

// 组合过滤条件
const filters = {
  type: 'storage',
  status: 'completed',
  identifyCode: 'STORAGE001'
}
```

## 样式定制

组件提供了以下CSS类名用于样式定制：

- `.search-form` - 搜索表单容器
- `.pagination` - 分页组件
- `.dialog-footer` - 底部按钮区域
- `.selected-row` - 选中的行样式

## 注意事项

1. 组件依赖 `@/api/recycle` 中的 `getRecyclePage` 接口
2. 组件依赖 `@/constants/orderTypes` 中的订单类型和状态常量
3. 组件依赖 `@/utils` 中的 `parseTime` 工具函数
4. 确保在使用前已正确配置这些依赖
