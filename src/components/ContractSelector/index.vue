<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    append-to-body
    class="contract-selector-dialog"
  >
    <div class="contract-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="合同名称">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入合同名称搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="合同类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择合同类型"
            clearable
            style="width: 150px;"
            @change="handleSearch"
          >
            <el-option label="采购合同" value="purchase" />
            <el-option label="销售合同" value="sale" />
            <el-option label="运输合同" value="transport" />
            <el-option label="加工合同" value="process" />
            <el-option label="仓储合同" value="storage" />
            <el-option label="其他合同" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作方">
          <el-input
            v-model="searchForm.partner"
            placeholder="请输入合作方搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 合同列表 -->
      <div class="contract-list-container">
        <el-table
          v-loading="loading"
          :data="filteredContractList"
          style="width: 100%"
          highlight-current-row
          border
          :row-class-name="getRowClassName"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <!-- 多选列 -->
          <el-table-column v-if="multiple" type="selection" width="55" :selectable="isSelectable" />

          <!-- 合同名称列 -->
          <el-table-column prop="name" label="合同名称" min-width="180" show-overflow-tooltip />
          <!-- 合同编号 -->
          <el-table-column prop="no" label="合同编号" width="120" align="center" />
          <!-- 合同类型列 -->
          <el-table-column prop="type" label="合同类型" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.type)" size="mini">
                {{ getTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 合作方列 -->
          <el-table-column prop="partnerName" label="合作方" min-width="120" show-overflow-tooltip />

          <!-- 起始时间列 -->
          <el-table-column prop="startTime" label="起始时间" width="120" align="center">
            <template #default="scope">
              {{ scope.row.startTime }}
            </template>
          </el-table-column>

          <!-- 结束时间列 -->
          <el-table-column prop="endTime" label="结束时间" width="120" align="center">
            <template #default="scope">
              {{ scope.row.endTime }}
            </template>
          </el-table-column>

          <!-- 合同金额列 -->
          <el-table-column prop="totalAmount" label="合同金额" width="120" align="center">
            <template #default="scope">
              <span class="amount-text">¥{{ formatAmount(scope.row.totalAmount) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

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

      <!-- 已选择合同展示 -->
      <div v-if="multiple && selectedContracts.length > 0" class="selected-contracts">
        <div class="selected-title">
          <span>已选择合同 ({{ selectedContracts.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="contract in selectedContracts"
            :key="contract.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeContract(contract)"
          >
            {{ contract.name }} - {{ getTypeText(contract.type) }}
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
import { getRecycleContractPage } from '@/api/recycleContract'
import { parseTime } from '@/utils'

export default {
  name: 'ContractSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择合同'
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
    // 默认选中的合同ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的合同ID数组
    disabledContracts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      contractList: [],
      filteredContractList: [],
      selectedContracts: [],
      searchKeyword: '',
      searchForm: {
        name: '',
        type: '',
        partner: ''
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
        return this.selectedContracts.length > 0
      } else {
        return this.selectedContracts.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedContracts.length})`
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
        this.selectedContracts = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchKeyword = ''
      this.searchForm = {
        name: '',
        type: '',
        partner: ''
      }
      this.currentPage = 1
      await this.fetchContractList()
    },

    // 获取合同列表
    async fetchContractList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }

        const response = await getRecycleContractPage(params)
        if (response && response.data) {
          this.contractList = response.data.records || []
          this.total = response.data.total || 0
        }
        this.filteredContractList = [...this.contractList]
      } catch (error) {
        console.error('获取合同列表失败:', error)
        this.$message.error('获取合同列表失败')
        this.contractList = []
        this.filteredContractList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      if (!this.searchKeyword.trim() && !this.searchForm.type && !this.searchForm.partner.trim()) {
        this.filteredContractList = [...this.contractList]
        return
      }

      const keyword = this.searchKeyword.toLowerCase()
      this.filteredContractList = this.contractList.filter(contract => {
        const nameMatch = !keyword || (contract.name && contract.name.toLowerCase().includes(keyword))
        const typeMatch = !this.searchForm.type || contract.type === this.searchForm.type
        const partnerMatch = !this.searchForm.partner || (contract.partner && contract.partner.toLowerCase().includes(this.searchForm.partner.toLowerCase()))

        return nameMatch && typeMatch && partnerMatch
      })
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchContractList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedContracts = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedContracts = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedContracts.some(contract => contract.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断合同是否可选
    isSelectable(row) {
      return !this.disabledContracts.includes(row.id)
    },

    // 移除已选择的合同
    removeContract(contract) {
      const index = this.selectedContracts.findIndex(c => c.id === contract.id)
      if (index > -1) {
        this.selectedContracts.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedContracts = []
    },

    // 合同类型文本转换
    getTypeText(type) {
      const typeMap = {
        purchase: '采购合同',
        sale: '销售合同',
        transport: '运输合同',
        process: '加工合同',
        storage: '仓储合同',
        other: '其他合同'
      }
      return typeMap[type] || type
    },

    // 合同类型标签样式
    getTypeTagType(type) {
      const typeTagMap = {
        purchase: 'primary',
        sale: 'success',
        transport: 'warning',
        process: 'info',
        storage: 'danger',
        other: 'info'
      }
      return typeTagMap[type] || 'info'
    },

    // 格式化日期
    formatDate(time) {
      return parseTime(time, '{y}-{m}-{d}')
    },

    // 格式化金额
    formatAmount(amount) {
      return amount ? amount.toLocaleString() : '0'
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedContracts.length === 0) {
        this.$message.warning('请至少选择一个合同')
        return
      }

      // 向父组件传递选中的合同
      this.$emit('confirm', this.selectedContracts)
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
.contract-selector-dialog {
  // 确保合同选择器弹窗在最顶层
  z-index: 3000 !important;

  .contract-selector {
    .search-input {
      width: 200px;
    }

    .contract-list-container {
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

    .selected-contracts {
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

.amount-text {
  color: #f56c6c;
  font-weight: bold;
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
