<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    append-to-body
    class="business-scope-selector-dialog"
  >
    <div class="business-scope-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="货物类型" prop="goodType">
          <el-input
            v-model="searchForm.goodType"
            placeholder="请输入货物类型搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="货物名称" prop="goodName">
          <el-input
            v-model="searchForm.goodName"
            placeholder="请输入货物名称搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="规格型号" prop="goodModel">
          <el-input
            v-model="searchForm.goodModel"
            placeholder="请输入规格型号搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 经营范围列表 -->
      <div class="business-scope-list-container">
        <el-table
          v-loading="loading"
          :data="filteredBusinessScopeList"
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

          <!-- 编号列 -->
          <el-table-column prop="no" label="编号" width="80" align="center" />

          <!-- 货物类型列 -->
          <el-table-column prop="goodType" label="货物类型" min-width="120" align="center" />

          <!-- 货物名称列 -->
          <el-table-column prop="goodName" label="货物名称" min-width="150" align="center" />

          <!-- 规格型号列 -->
          <el-table-column prop="goodModel" label="规格型号" min-width="150" align="center" />

          <!-- 公示价格列 -->
          <el-table-column prop="publicPrice" label="公示价格" width="120" align="center">
            <template #default="scope">
              <span class="price">¥{{ scope.row.publicPrice || 0 }}</span>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column prop="isShow" label="状态" width="80" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.isShow === 'Y' ? 'success' : 'danger'" size="mini">
                {{ scope.row.isShow === 'Y' ? '显示' : '隐藏' }}
              </el-tag>
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

      <!-- 已选择经营范围展示 -->
      <div v-if="multiple && selectedBusinessScopes.length > 0" class="selected-business-scopes">
        <div class="selected-title">
          <span>已选择经营范围 ({{ selectedBusinessScopes.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="item in selectedBusinessScopes"
            :key="item.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeBusinessScope(item)"
          >
            {{ item.goodType }} - {{ item.goodName }} ({{ item.goodModel }})
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
import { getBusinessScopePage } from '@/api/businessScope'

export default {
  name: 'BusinessScopeSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择经营范围'
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
    // 默认选中的经营范围ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的经营范围ID数组
    disabledBusinessScopes: {
      type: Array,
      default: () => []
    },
    // 是否只显示启用的经营范围
    onlyShowEnabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      businessScopeList: [],
      filteredBusinessScopeList: [],
      selectedBusinessScopes: [],
      searchForm: {
        goodType: '',
        goodName: '',
        goodModel: ''
      },
      currentPage: 1,
      total: 0,
      loading: false,
      searchTimer: null // 防抖定时器
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
        return this.selectedBusinessScopes.length > 0
      } else {
        return this.selectedBusinessScopes.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedBusinessScopes.length})`
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
        this.selectedBusinessScopes = [...newVal]
      },
      immediate: true
    }
  },
  beforeUnmount() {
    // 清除防抖定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchForm = {
        goodType: '',
        goodName: '',
        goodModel: ''
      }
      this.currentPage = 1
      await this.fetchBusinessScopeList()
    },

    // 获取经营范围列表
    async fetchBusinessScopeList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }

        // 如果只显示启用的经营范围
        if (this.onlyShowEnabled) {
          params.isShow = 'Y'
        }

        // 添加搜索条件
        if (this.searchForm.goodType && this.searchForm.goodType.trim()) {
          params.goodType = this.searchForm.goodType.trim()
        }
        if (this.searchForm.goodName && this.searchForm.goodName.trim()) {
          params.goodName = this.searchForm.goodName.trim()
        }
        if (this.searchForm.goodModel && this.searchForm.goodModel.trim()) {
          params.goodModel = this.searchForm.goodModel.trim()
        }

        const response = await getBusinessScopePage(params)
        if (response && response.data) {
          this.businessScopeList = response.data.records || []
          this.total = response.data.total || 0
        }
        this.filteredBusinessScopeList = [...this.businessScopeList]
      } catch (error) {
        console.error('获取经营范围列表失败:', error)
        this.$message.error('获取经营范围列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理（带防抖）
    handleSearch() {
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      // 重置到第一页
      this.currentPage = 1

      // 设置防抖，500ms 后调用接口
      this.searchTimer = setTimeout(() => {
        this.fetchBusinessScopeList()
      }, 500)
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchBusinessScopeList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedBusinessScopes = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedBusinessScopes = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedBusinessScopes.some(item => item.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断经营范围是否可选
    isSelectable(row) {
      return !this.disabledBusinessScopes.includes(row.id)
    },

    // 移除已选择的经营范围
    removeBusinessScope(item) {
      const index = this.selectedBusinessScopes.findIndex(i => i.id === item.id)
      if (index > -1) {
        this.selectedBusinessScopes.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedBusinessScopes = []
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedBusinessScopes.length === 0) {
        this.$message.warning('请至少选择一个经营范围')
        return
      }

      // 向父组件传递选中的经营范围
      this.$emit('confirm', this.selectedBusinessScopes)
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
.business-scope-selector-dialog {
  .business-scope-selector {
    .search-container {
      margin-bottom: 20px;

      .search-input {
        width: 200px;
      }
    }

    .business-scope-list-container {
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

    .selected-business-scopes {
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

// 价格样式
.price {
  color: #f56c6c;
  font-weight: bold;
}

// 全局样式
::v-deep .selected-row {
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
