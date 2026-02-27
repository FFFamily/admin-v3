# 经营范围选择器 (BusinessScopeSelector)

一个用于选择经营范围的Vue组件，支持单选和多选模式。

## 功能特性

- 支持单选和多选模式
- 支持按货物类型、货物名称、规格型号搜索
- 支持分页显示
- 支持默认选中项
- 支持禁用特定项
- 支持只显示启用的经营范围
- 响应式设计，适配不同屏幕尺寸

## 使用方法

### 基础用法

```vue
<template>
  <div>
    <el-button @click="showSelector = true">选择经营范围</el-button>
    
    <BusinessScopeSelector
      :visible.sync="showSelector"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  components: {
    BusinessScopeSelector
  },
  data() {
    return {
      showSelector: false
    }
  },
  methods: {
    handleConfirm(selectedItems) {
      console.log('选中的经营范围:', selectedItems)
      // 处理选中的经营范围
    }
  }
}
</script>
```

### 多选模式

```vue
<template>
  <div>
    <el-button @click="showSelector = true">多选经营范围</el-button>
    
    <BusinessScopeSelector
      :visible.sync="showSelector"
      :multiple="true"
      @confirm="handleConfirm"
    />
  </div>
</template>
```

### 带默认选中项

```vue
<template>
  <div>
    <el-button @click="showSelector = true">编辑经营范围</el-button>
    
    <BusinessScopeSelector
      :visible.sync="showSelector"
      :default-selected="defaultSelected"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSelector: false,
      defaultSelected: [
        { id: 1, goodType: '电子产品', goodName: '手机', goodModel: 'iPhone 13' }
      ]
    }
  }
}
</script>
```

### 禁用特定项

```vue
<template>
  <div>
    <BusinessScopeSelector
      :visible.sync="showSelector"
      :disabled-business-scopes="disabledIds"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      disabledIds: [1, 2, 3] // 禁用ID为1、2、3的经营范围
    }
  }
}
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 弹框是否可见 |
| title | String | '选择经营范围' | 弹框标题 |
| width | String | '1000px' | 弹框宽度 |
| multiple | Boolean | false | 是否多选 |
| showPagination | Boolean | true | 是否显示分页 |
| pageSize | Number | 10 | 每页显示数量 |
| defaultSelected | Array | [] | 默认选中的经营范围数组 |
| disabledBusinessScopes | Array | [] | 禁用的经营范围ID数组 |
| onlyShowEnabled | Boolean | true | 是否只显示启用的经营范围 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认选择时触发 | selectedItems: 选中的经营范围数组 |
| close | 关闭弹框时触发 | - |
| update:visible | 弹框显示状态变化时触发 | visible: 布尔值 |

## 数据结构

选中的经营范围对象包含以下字段：

```javascript
{
  id: 1,                    // 唯一标识
  no: 'BS001',             // 编号
  goodType: '电子产品',      // 货物类型
  goodName: '手机',         // 货物名称
  goodModel: 'iPhone 13',  // 规格型号
  publicPrice: 5999,       // 公示价格
  goodRemark: '备注信息',   // 货物备注
  isShow: 'Y',             // 是否显示 (Y/N)
  createTime: '2024-01-01' // 创建时间
}
```

## 样式定制

组件使用scoped样式，如需自定义样式，可以通过以下方式：

```vue
<style>
/* 覆盖组件样式 */
.business-scope-selector-dialog .el-dialog {
  border-radius: 8px;
}

.business-scope-selector-dialog .el-table {
  border-radius: 4px;
}
</style>
```

## 注意事项

1. 组件依赖Element UI组件库
2. 需要确保`@/api/businessScope`中的API接口可用
3. 组件会自动处理分页和搜索逻辑
4. 单选模式下点击行即可选中
5. 多选模式下需要勾选复选框 