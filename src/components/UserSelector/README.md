# UserSelector 用户选择器组件

一个功能完整的用户选择弹框组件，支持单选和多选模式，具有搜索、分页、选中效果等功能。

## 功能特性

- ✅ 支持单选和多选模式
- ✅ 用户信息展示（头像、用户账号、用户名称、用户类型、状态）
- ✅ 实时搜索功能（支持用户账号、昵称、城市搜索）
- ✅ 分页显示
- ✅ 增强的选中效果高亮（蓝色边框和背景）
- ✅ 支持默认选中
- ✅ 支持禁用特定用户
- ✅ 响应式设计
- ✅ 完整的事件回调

## 使用方法

### 1. 引入组件

```javascript
import UserSelector from '@/components/UserSelector'

export default {
  components: {
    UserSelector
  }
}
```

### 2. 基础用法

#### 单选模式

```vue
<template>
  <div>
    <el-button @click="showSelector">选择用户</el-button>
    
    <UserSelector
      :visible.sync="selectorVisible"
      title="选择用户"
      :multiple="false"
      @confirm="handleConfirm"
      @close="handleClose"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectorVisible: false
    }
  },
  methods: {
    showSelector() {
      this.selectorVisible = true
    },
    handleConfirm(users) {
      // users 是一个数组，单选模式下只有一个元素
      console.log('选中的用户:', users[0])
    },
    handleClose() {
      console.log('选择器已关闭')
    }
  }
}
</script>
```

#### 多选模式

```vue
<template>
  <div>
    <el-button @click="showSelector">选择多个用户</el-button>
    
    <UserSelector
      :visible.sync="selectorVisible"
      title="选择多个用户"
      :multiple="true"
      @confirm="handleConfirm"
      @close="handleClose"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectorVisible: false
    }
  },
  methods: {
    showSelector() {
      this.selectorVisible = true
    },
    handleConfirm(users) {
      // users 是一个数组，包含所有选中的用户
      console.log('选中的用户:', users)
    },
    handleClose() {
      console.log('选择器已关闭')
    }
  }
}
</script>
```

### 3. 高级用法

#### 带默认选择

```vue
<UserSelector
  :visible.sync="selectorVisible"
  title="选择用户"
  :multiple="true"
  :default-selected="defaultUsers"
  @confirm="handleConfirm"
/>
```

#### 禁用特定用户

```vue
<UserSelector
  :visible.sync="selectorVisible"
  title="选择用户"
  :multiple="true"
  :disabled-users="[1, 3, 5]"
  @confirm="handleConfirm"
/>
```

#### 自定义分页大小

```vue
<UserSelector
  :visible.sync="selectorVisible"
  title="选择用户"
  :page-size="20"
  @confirm="handleConfirm"
/>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 弹框是否可见 |
| title | String | '选择用户' | 弹框标题 |
| width | String | '800px' | 弹框宽度 |
| multiple | Boolean | false | 是否多选模式 |
| showPagination | Boolean | true | 是否显示分页 |
| pageSize | Number | 10 | 每页显示数量 |
| defaultSelected | Array | [] | 默认选中的用户数组 |
| disabledUsers | Array | [] | 禁用的用户ID数组 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| confirm | users: Array | 确认选择时触发，返回选中的用户数组 |
| close | - | 弹框关闭时触发 |
| update:visible | visible: Boolean | 弹框显示状态变化时触发 |

## 用户数据结构

组件期望的用户数据格式：

```javascript
{
  id: 1,                    // 用户ID（必需）
  username: 'zhangsan001',  // 用户账号（必需）
  nickname: '张三',         // 用户名称（必需）
  openid: 'openid123',      // OpenID
  avatar: 'avatar.jpg',     // 头像URL
  useType: 'person',        // 用户类型：person-用户，company-企业
  status: 1,                // 状态：1-正常，0-禁用
  city: '北京'              // 城市
}
```

## 样式定制

组件使用 Element UI 的样式系统，可以通过以下方式定制样式：

```scss
// 自定义选中行样式
:deep(.selected-row) {
  background-color: #e8f4fd !important;
  
  &:hover {
    background-color: #d1ecf1 !important;
  }
}

// 自定义弹框样式
.user-selector-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
```

## 注意事项

1. 组件依赖 Element UI 组件库
2. 需要配置正确的用户API接口
3. 单选模式下，点击行即可选中用户
4. 多选模式下，使用复选框进行选择
5. 搜索功能基于前端过滤，大数据量时建议使用后端搜索

## 示例页面

查看完整的使用示例，请访问：`/demo/user-selector-demo`

## 更新日志

- v1.0.0 - 初始版本，支持基础的用户选择功能 