# AddressSelector 地址选择器组件

一个可复用的地址选择器组件，支持单选和多选模式，提供搜索、分页等功能。

## 功能特性

- ✅ 支持单选和多选模式
- ✅ 支持按用户名称、地址、分类搜索
- ✅ 支持分页显示
- ✅ 支持禁用特定地址
- ✅ 支持默认选中地址
- ✅ 响应式设计，适配不同屏幕尺寸

## 基本用法

### 1. 导入组件

```javascript
import AddressSelector from '@/components/AddressSelector'
```

### 2. 注册组件

```javascript
export default {
  components: {
    AddressSelector
  }
}
```

### 3. 在模板中使用

```vue
<template>
  <div>
    <!-- 单选模式 -->
    <AddressSelector 
      :visible.sync="addressSelectorVisible" 
      title="选择地址" 
      :multiple="false"
      @confirm="handleAddressSelected" 
    />
    
    <!-- 多选模式 -->
    <AddressSelector 
      :visible.sync="addressSelectorVisible" 
      title="选择地址" 
      :multiple="true"
      @confirm="handleAddressSelected" 
    />
  </div>
</template>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 弹框是否可见 |
| title | String | '选择地址' | 弹框标题 |
| width | String | '900px' | 弹框宽度 |
| multiple | Boolean | false | 是否多选 |
| showPagination | Boolean | true | 是否显示分页 |
| pageSize | Number | 10 | 每页显示数量 |
| defaultSelected | Array | [] | 默认选中的地址ID数组 |
| disabledAddresses | Array | [] | 禁用的地址ID数组 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| confirm | addresses | 确认选择时触发，返回选中的地址数组 |
| close | - | 关闭弹框时触发 |
| update:visible | visible | 弹框显示状态变化时触发 |

## 使用示例

### 单选模式

```vue
<template>
  <div>
    <el-button @click="showAddressSelector">选择地址</el-button>
    
    <AddressSelector 
      :visible.sync="addressSelectorVisible" 
      title="选择地址" 
      :multiple="false"
      @confirm="handleAddressSelected" 
    />
  </div>
</template>

<script>
import AddressSelector from '@/components/AddressSelector'

export default {
  components: {
    AddressSelector
  },
  data() {
    return {
      addressSelectorVisible: false
    }
  },
  methods: {
    showAddressSelector() {
      this.addressSelectorVisible = true
    },
    handleAddressSelected(addresses) {
      if (addresses && addresses.length > 0) {
        const address = addresses[0]
        console.log('选中的地址:', address)
        // 处理选中的地址
      }
    }
  }
}
</script>
```

### 多选模式

```vue
<template>
  <div>
    <el-button @click="showAddressSelector">选择多个地址</el-button>
    
    <AddressSelector 
      :visible.sync="addressSelectorVisible" 
      title="选择地址" 
      :multiple="true"
      :default-selected="defaultSelectedAddresses"
      :disabled-addresses="disabledAddresses"
      @confirm="handleAddressSelected" 
    />
  </div>
</template>

<script>
import AddressSelector from '@/components/AddressSelector'

export default {
  components: {
    AddressSelector
  },
  data() {
    return {
      addressSelectorVisible: false,
      defaultSelectedAddresses: [1, 2], // 默认选中的地址ID
      disabledAddresses: [3, 4] // 禁用的地址ID
    }
  },
  methods: {
    showAddressSelector() {
      this.addressSelectorVisible = true
    },
    handleAddressSelected(addresses) {
      console.log('选中的地址列表:', addresses)
      // 处理选中的地址列表
    }
  }
}
</script>
```

### 在表单中使用

```vue
<template>
  <el-form>
    <el-form-item label="地址">
      <el-input 
        v-model="selectedAddressText" 
        placeholder="请选择地址" 
        readonly
      >
        <el-button slot="append" @click="showAddressSelector">
          选择地址
        </el-button>
      </el-input>
    </el-form-item>
    
    <AddressSelector 
      :visible.sync="addressSelectorVisible" 
      title="选择地址" 
      :multiple="false"
      @confirm="handleAddressSelected" 
    />
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      addressSelectorVisible: false,
      selectedAddress: null,
      selectedAddressText: ''
    }
  },
  methods: {
    showAddressSelector() {
      this.addressSelectorVisible = true
    },
    handleAddressSelected(addresses) {
      if (addresses && addresses.length > 0) {
        const address = addresses[0]
        this.selectedAddress = address
        this.selectedAddressText = `${address.accountName} - ${address.realAddress}`
      }
    }
  }
}
</script>
```

## 地址数据结构

地址对象包含以下字段：

```javascript
{
  id: 1,                    // 地址ID
  accountId: 123,           // 用户ID
  accountName: '张三',       // 用户名称
  category: '家庭地址',      // 地址分类
  realAddress: '北京市朝阳区...', // 详细地址
  remark: '备注信息',        // 备注
  createTime: '2024-01-01 12:00:00' // 创建时间
}
```

## 注意事项

1. 组件依赖 `@/api/address` 中的 `getAddressPage` 方法
2. 确保后端API返回的数据结构符合组件要求
3. 在多选模式下，可以通过 `defaultSelected` 和 `disabledAddresses` 控制默认选中和禁用状态
4. 组件会自动处理搜索、分页等逻辑，无需额外配置 