<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    append-to-body
    class="bank-info-selector-dialog"
  >
    <div class="bank-info-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item v-if="!filterAccountId" label="账户ID" prop="accountId">
          <el-input
            v-model="searchParams.accountId"
            placeholder="请输入账户ID"
            class="search-input"
            clearable
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="开户行" prop="bankName">
          <el-input
            v-model="searchParams.bankName"
            placeholder="请输入开户行名称"
            class="search-input"
            clearable
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="银行卡号" prop="cardNumber">
          <el-input
            v-model="searchParams.cardNumber"
            placeholder="请输入银行卡号"
            class="search-input"
            clearable
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 银行信息列表 -->
      <el-table
        :data="filteredBankInfoList"
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

        <!-- 账户ID列 -->
        <el-table-column prop="accountId" label="账户ID" min-width="120" />

        <!-- 开户行列 -->
        <el-table-column prop="bankName" label="开户行" min-width="150" />

        <!-- 银行卡号列 -->
        <el-table-column prop="cardNumber" label="银行卡号" min-width="180" />

        <!-- 联行号列 -->
        <el-table-column prop="bankCode" label="联行号" width="120" />

        <!-- 是否默认列 -->
        <el-table-column label="是否默认" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isDefault === '1'" type="success" size="mini">是</el-tag>
            <el-tag v-else type="info" size="mini">否</el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
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

      <!-- 已选择银行信息展示 -->
      <div v-if="multiple && selectedBankInfos.length > 0" class="selected-bank-infos">
        <div class="selected-title">
          <span>已选择银行信息 ({{ selectedBankInfos.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="bankInfo in selectedBankInfos"
            :key="bankInfo.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeBankInfo(bankInfo)"
          >
            {{ bankInfo.bankName }} - {{ bankInfo.cardNumber }}
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
import { getBankInfoList } from '@/api/bankInfo'

export default {
  name: 'BankInfoSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择银行信息'
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
    // 默认选中的银行信息ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的银行信息ID数组
    disabledBankInfos: {
      type: Array,
      default: () => []
    },
    // 过滤的账户ID，如果传入则只显示该账户的银行信息
    filterAccountId: {
      type: [String, Number],
      default: ''
    },
    // 外部过滤条件
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      bankInfoList: [],
      filteredBankInfoList: [],
      selectedBankInfos: [],
      searchParams: {
        accountId: '',
        bankName: '',
        cardNumber: ''
      },
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
        return this.selectedBankInfos.length > 0
      } else {
        return this.selectedBankInfos.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedBankInfos.length})`
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
        this.selectedBankInfos = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchParams = {
        accountId: this.filterAccountId || '',
        bankName: '',
        cardNumber: '',
        ...this.filters // 合并外部过滤条件
      }
      this.currentPage = 1
      await this.fetchBankInfoList()
    },

    // 获取银行信息列表
    async fetchBankInfoList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchParams, // 包含搜索参数和过滤条件
          ...this.filters // 合并外部过滤条件
        }

        // 如果传入了filterAccountId，则自动添加到搜索参数中
        if (this.filterAccountId) {
          params.accountId = this.filterAccountId
        }

        const response = await getBankInfoList(params)
        if (response && response.data) {
          this.bankInfoList = response.data.records || []
          this.total = response.data.total || 0
        }
        this.filteredBankInfoList = [...this.bankInfoList]
      } catch (error) {
        console.error('获取银行信息列表失败:', error)
        this.$message.error('获取银行信息列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      const searchParams = {
        ...this.searchParams,
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters // 合并外部过滤条件
      }

      // 如果传入了filterAccountId，则自动添加到搜索参数中
      if (this.filterAccountId) {
        searchParams.accountId = this.filterAccountId
      }

      getBankInfoList(searchParams).then(res => {
        if (res && res.data) {
          this.bankInfoList = res.data.records || []
          this.total = res.data.total || 0
        }
        this.filteredBankInfoList = [...this.bankInfoList]
      }).catch(err => {
        console.error('搜索银行信息失败:', err)
        this.$message.error('搜索银行信息失败')
      })
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchBankInfoList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedBankInfos = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedBankInfos = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedBankInfos.some(bankInfo => bankInfo.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断银行信息是否可选
    isSelectable(row) {
      return !this.disabledBankInfos.includes(row.id)
    },

    // 移除已选择的银行信息
    removeBankInfo(bankInfo) {
      const index = this.selectedBankInfos.findIndex(b => b.id === bankInfo.id)
      if (index > -1) {
        this.selectedBankInfos.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedBankInfos = []
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedBankInfos.length === 0) {
        this.$message.warning('请至少选择一个银行信息')
        return
      }

      // 向父组件传递选中的银行信息
      this.$emit('confirm', this.selectedBankInfos)
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
.bank-info-selector-dialog {
  // 确保银行信息选择器弹窗在最顶层
  z-index: 3000 !important;

  .bank-info-selector {
    .search-container {
      margin-bottom: 20px;

      .search-input {
        width: 200px;
      }
    }

    .bank-info-list-container {
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

    .selected-bank-infos {
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
