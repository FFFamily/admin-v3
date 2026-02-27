<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    class="invoice-title-selector-dialog"
  >
    <div class="invoice-title-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="发票抬头名称" prop="title">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入发票抬头名称搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="taxNumber">
          <el-input
            v-model="searchTaxNumber"
            placeholder="请输入纳税人识别号搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 发票抬头列表 -->
      <el-table
        v-loading="loading"
        :data="filteredInvoiceTitleList"
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

        <!-- 发票抬头名称列 -->
        <el-table-column prop="title" label="发票抬头名称" min-width="180" />

        <!-- 纳税人识别号列 -->
        <el-table-column prop="taxNumber" label="纳税人识别号" min-width="180" />

        <!-- 注册地址列 -->
        <el-table-column prop="registeredAddress" label="注册地址" min-width="200" />

        <!-- 联系电话列 -->
        <el-table-column prop="phone" label="联系电话" width="150" />

        <!-- 开户行列 -->
        <el-table-column prop="bankName" label="开户行" min-width="150" />

        <!-- 默认开票信息列 -->
        <el-table-column prop="isDefault" label="默认开票信息" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isDefault === '1' ? 'success' : 'info'" size="mini">
              {{ scope.row.isDefault === '1' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
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

      <!-- 已选择发票抬头展示 -->
      <div v-if="multiple && selectedInvoiceTitles.length > 0" class="selected-invoice-titles">
        <div class="selected-title">
          <span>已选择发票抬头 ({{ selectedInvoiceTitles.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="invoiceTitle in selectedInvoiceTitles"
            :key="invoiceTitle.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeInvoiceTitle(invoiceTitle)"
          >
            {{ invoiceTitle.title }} - {{ invoiceTitle.taxNumber }}
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
import { getInvoiceTitlePage } from '@/api/invoice'

export default {
  name: 'InvoiceTitleSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择发票抬头'
    },
    // 弹框宽度
    width: {
      type: String,
      default: '1000px'
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
    // 默认选中的发票抬头ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的发票抬头ID数组
    disabledInvoiceTitles: {
      type: Array,
      default: () => []
    },
    // 账户ID过滤（可选）
    accountId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      invoiceTitleList: [],
      filteredInvoiceTitleList: [],
      selectedInvoiceTitles: [],
      searchKeyword: '',
      searchTaxNumber: '',
      currentPage: 1,
      total: 0,
      searchForm: {},
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
        return this.selectedInvoiceTitles.length > 0
      } else {
        return this.selectedInvoiceTitles.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedInvoiceTitles.length})`
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
        this.selectedInvoiceTitles = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchKeyword = ''
      this.searchTaxNumber = ''
      this.currentPage = 1
      await this.fetchInvoiceTitleList()
    },

    // 获取发票抬头列表
    async fetchInvoiceTitleList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }

        // 如果有账户ID过滤条件
        if (this.accountId) {
          params.accountId = this.accountId
        }

        const response = await getInvoiceTitlePage(params)
        if (response && response.data) {
          this.invoiceTitleList = response.data.records || response.data || []
          this.total = response.data.total || 0
        }
        this.filteredInvoiceTitleList = [...this.invoiceTitleList]
      } catch (error) {
        console.error('获取发票抬头列表失败:', error)
        this.$message.error('获取发票抬头列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      if (!this.searchKeyword.trim() && !this.searchTaxNumber.trim()) {
        this.filteredInvoiceTitleList = [...this.invoiceTitleList]
        return
      }

      const titleKeyword = this.searchKeyword.toLowerCase()
      const taxNumberKeyword = this.searchTaxNumber.toLowerCase()

      this.filteredInvoiceTitleList = this.invoiceTitleList.filter(invoiceTitle => {
        const titleMatch = !titleKeyword ||
          (invoiceTitle.title && invoiceTitle.title.toLowerCase().includes(titleKeyword))
        const taxNumberMatch = !taxNumberKeyword ||
          (invoiceTitle.taxNumber && invoiceTitle.taxNumber.toLowerCase().includes(taxNumberKeyword))

        return titleMatch && taxNumberMatch
      })
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchInvoiceTitleList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedInvoiceTitles = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedInvoiceTitles = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedInvoiceTitles.some(invoiceTitle => invoiceTitle.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断发票抬头是否可选
    isSelectable(row) {
      return !this.disabledInvoiceTitles.includes(row.id)
    },

    // 移除已选择的发票抬头
    removeInvoiceTitle(invoiceTitle) {
      const index = this.selectedInvoiceTitles.findIndex(item => item.id === invoiceTitle.id)
      if (index > -1) {
        this.selectedInvoiceTitles.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedInvoiceTitles = []
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedInvoiceTitles.length === 0) {
        this.$message.warning('请至少选择一个发票抬头')
        return
      }

      // 向父组件传递选中的发票抬头
      this.$emit('confirm', this.selectedInvoiceTitles)
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
.invoice-title-selector-dialog {
  // 确保发票抬头选择器弹窗在最顶层
  z-index: 3000 !important;

  .invoice-title-selector {
    .search-container {
      margin-bottom: 20px;

      .search-input {
        width: 300px;
      }
    }

    .invoice-title-list-container {
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

    .selected-invoice-titles {
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
