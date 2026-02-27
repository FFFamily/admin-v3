# AdminUserSelector 后台用户选择器组件

一个用于选择后台管理账号的弹窗选择器组件，支持单选和多选模式。

## 功能特性

- ✅ 支持单选和多选模式
- ✅ 支持分页加载
- ✅ 支持搜索过滤（按登录账号、用户昵称、手机号）
- ✅ 支持禁用特定用户
- ✅ 支持默认选中用户
- ✅ 响应式设计，适配不同屏幕尺寸
- ✅ 完整的用户交互反馈

## 使用方法

### 基本用法

```vue
<template>
  <div>
    <el-button @click="showSelector">选择后台用户</el-button>
    
    <AdminUserSelector
      :visible.sync="selectorVisible"
      title="选择后台用户"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
import AdminUserSelector from '@/components/AdminUserSelector'

export default {
  components: {
    AdminUserSelector
  },
  data() {
    return {
      selectorVisible: false
    }
  },
  methods: {
    showSelector() {
      this.selectorVisible = true
    },
    handleConfirm(selectedUsers) {
      console.log('选中的用户:', selectedUsers)
      this.selectorVisible = false
    }
  }
}
</script>
```

### 多选模式

```vue
<AdminUserSelector
  :visible.sync="selectorVisible"
  title="选择多个后台用户"
  :multiple="true"
  @confirm="handleMultipleConfirm"
/>
```

### 带禁用用户

```vue
<AdminUserSelector
  :visible.sync="selectorVisible"
  title="选择后台用户"
  :disabled-admin-users="[1, 2, 3]"
  @confirm="handleConfirm"
/>
```

### 默认选中用户

```vue
<AdminUserSelector
  :visible.sync="selectorVisible"
  title="选择后台用户"
  :default-selected="defaultUsers"
  @confirm="handleConfirm"
/>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 弹框是否可见 |
| title | String | '选择后台用户' | 弹框标题 |
| width | String | '900px' | 弹框宽度 |
| multiple | Boolean | false | 是否多选 |
| showPagination | Boolean | true | 是否显示分页 |
| pageSize | Number | 10 | 每页显示数量 |
| defaultSelected | Array | [] | 默认选中的用户ID数组 |
| disabledAdminUsers | Array | [] | 禁用的用户ID数组 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| confirm | selectedUsers | 确认选择时触发，返回选中的用户数组 |
| close | - | 关闭弹框时触发 |
| update:visible | visible | 弹框可见性变化时触发 |

## 用户数据结构

```javascript
{
  id: 1,                    // 用户ID
  username: 'admin',        // 登录账号
  nickname: '管理员',        // 用户昵称
  phone: '13800138000',     // 手机号
  status: 'use',           // 状态：'use'使用中，'disable'已关闭
  avatar: 'http://...'     // 头像URL
}
```

## 样式定制

组件使用 SCSS 编写样式，支持通过 CSS 变量或深度选择器进行定制：

```scss
// 自定义选中行样式
:deep(.selected-row) {
  background-color: #your-color !important;
  border-left: 4px solid #your-border-color !important;
}

// 自定义弹框样式
.admin-user-selector-dialog {
  .el-dialog {
    border-radius: 8px;
  }
}
```

## 注意事项

1. 确保已正确配置后台用户API接口
2. 组件依赖 Element UI，请确保项目中已安装
3. 搜索功能为前端过滤，如需服务端搜索请修改 `handleSearch` 方法
4. 分页功能调用 `getAdminUserPage` API，请确保接口返回格式正确

## 更新日志

### v1.0.0
- 初始版本发布
- 支持单选和多选模式
- 支持搜索和分页功能
- 支持用户禁用和默认选中
