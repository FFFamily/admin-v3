<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    append-to-body
    class="address-selector-dialog"
  >
    <div class="address-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="用户名称" prop="accountName">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入用户名称搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="地址" prop="realAddress">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入地址搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择分类"
            clearable
            style="width: 150px;"
            @change="handleSearch"
          >
            <el-option label="家庭地址" value="家庭地址" />
            <el-option label="工作地址" value="工作地址" />
            <el-option label="其他地址" value="其他地址" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 地址列表 -->
      <el-table
        v-loading="loading"
        :data="filteredAddressList"
        style="width: 100%"
        highlight-current-row
        border
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <!-- 多选列 -->
        <el-table-column
          v-if="multiple"
          type="selection"
          width="55"
          :selectable="isSelectable"
        />

        <!-- 用户名称列 -->
        <el-table-column prop="accountName" label="用户名称" min-width="120" />

        <!-- 分类列 -->
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)" size="mini">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 地址列 -->
        <el-table-column prop="realAddress" label="地址" min-width="200" show-overflow-tooltip />

        <!-- 备注列 -->
        <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />

        <!-- 创建时间列 -->
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>

      <!-- 分页 -->
      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 已选择地址展示 -->
      <div v-if="multiple && selectedAddresses.length > 0" class="selected-addresses">
        <div class="selected-title">
          <span>已选择地址 ({{ selectedAddresses.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="address in selectedAddresses"
            :key="address.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeAddress(address)"
          >
            {{ address.accountName }} - {{ address.realAddress }}
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!canConfirm" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getAddressPage } from '@/api/address'

export default {
  name: 'AddressSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择地址'
    },
    // 弹框宽度
    width: {
      type: String,
      default: '900px'
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 每页显示数量
    pageSize: {
      type: Number,
      default: 10
    },
    // 默认选中的地址ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的地址ID数组
    disabledAddresses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      addressList: [],
      filteredAddressList: [],
      selectedAddresses: [],
      searchKeyword: '',
      searchForm: {
        category: ''
      },
      currentPage: 1,
      total: 0,
      loading: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    canConfirm() {
      if (this.multiple) {
        return this.selectedAddresses.length > 0
      } else {
        return this.selectedAddresses.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedAddresses.length})`
      } else {
        return '确定选择'
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData()
      }
    },
    defaultSelected: {
      handler(newVal) {
        this.selectedAddresses = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchKeyword = ''
      this.searchForm.category = ''
      this.currentPage = 1
      await this.fetchAddressList()
    },

    // 获取地址列表
    async fetchAddressList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          accountName: this.searchKeyword || undefined,
          realAddress: this.searchKeyword || undefined,
          category: this.searchForm.category || undefined
        }

        const response = await getAddressPage(params)
        if (response && response.data) {
          this.addressList = response.data.records || []
          this.total = response.data.total || 0
        }
        this.filteredAddressList = [...this.addressList]
      } catch (error) {
        console.error('获取地址列表失败:', error)
        this.$message.error('获取地址列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      this.currentPage = 1
      this.fetchAddressList()
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchAddressList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedAddresses = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedAddresses = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedAddresses.some(address => address.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断地址是否可选
    isSelectable(row) {
      return !this.disabledAddresses.includes(row.id)
    },

    // 移除已选择的地址
    removeAddress(address) {
      const index = this.selectedAddresses.findIndex(a => a.id === address.id)
      if (index > -1) {
        this.selectedAddresses.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedAddresses = []
    },

    // 获取分类标签类型
    getCategoryTagType(category) {
      const typeMap = {
        '家庭地址': 'success',
        '工作地址': 'primary',
        '其他地址': 'info'
      }
      return typeMap[category] || 'info'
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedAddresses.length === 0) {
        this.$message.warning('请至少选择一个地址')
        return
      }

      // 向父组件传递选中的地址
      this.$emit('confirm', this.selectedAddresses)
      this.handleClose()
    },

    // 关闭弹框
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.address-selector-dialog {
  // 确保地址选择器弹窗在最顶层
  z-index: 3000 !important;

  .address-selector {
    .search-container {
      margin-bottom: 20px;

      .search-input {
        width: 300px;
      }
    }

    .address-list-container {
      max-height: 400px;
      overflow-y: auto;

      .selected-row {
        background-color: #e6f7ff !important;
        border-left: 4px solid #1890ff !important;

        &:hover {
          background-color: #bae7ff !important;
        }
      }

      // 增强选中行的视觉效果
      .el-table__row.selected-row {
        td {
          background-color: #e6f7ff !important;
        }

        &:hover td {
          background-color: #bae7ff !important;
        }
      }
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }

    .selected-addresses {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;

      .selected-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: 500;
        color: #606266;
      }

      .selected-tags {
        .el-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}

// 全局样式
:deep(.selected-row) {
  background-color: #e6f7ff !important;
  border-left: 4px solid #1890ff !important;

  &:hover {
    background-color: #bae7ff !important;
  }

  td {
    background-color: #e6f7ff !important;
  }
}
</style>
