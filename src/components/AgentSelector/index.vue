<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    append-to-body
    class="agent-selector-dialog"
  >
    <div class="agent-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="编号" prop="no">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入编号搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="经办人姓名" prop="name">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入经办人姓名搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入手机号搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 经办人列表 -->
      <el-table
        v-loading="loading"
        :data="filteredAgentList"
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
        <el-table-column prop="no" label="编号" min-width="120" />

        <!-- 账号名称列 -->
        <el-table-column prop="accountName" label="账号名称" min-width="120" />

        <!-- 经办人姓名列 -->
        <el-table-column prop="name" label="经办人姓名" min-width="120" />

        <!-- 手机号列 -->
        <el-table-column prop="phone" label="手机号" min-width="120" />

        <!-- 身份证号列 -->
        <el-table-column prop="idCard" label="身份证号" min-width="150" show-overflow-tooltip />
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

      <!-- 已选择经办人展示 -->
      <div v-if="multiple && selectedAgents.length > 0" class="selected-agents">
        <div class="selected-title">
          <span>已选择经办人 ({{ selectedAgents.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="agent in selectedAgents"
            :key="agent.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeAgent(agent)"
          >
            {{ agent.name }} - {{ agent.no }}
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
import { getAgentPage } from '@/api/agent'

export default {
  name: 'AgentSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择经办人'
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
    // 默认选中的经办人ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的经办人ID数组
    disabledAgents: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      agentList: [],
      filteredAgentList: [],
      selectedAgents: [],
      searchKeyword: '',
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
        return this.selectedAgents.length > 0
      } else {
        return this.selectedAgents.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedAgents.length})`
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
        this.selectedAgents = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchKeyword = ''
      this.currentPage = 1
      await this.fetchAgentList()
    },

    // 获取经办人列表
    async fetchAgentList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }

        const response = await getAgentPage(params)
        if (response && response.data) {
          this.agentList = response.data.records || response.data || []
          this.total = response.data.total || 0
        }
        this.filteredAgentList = [...this.agentList]
      } catch (error) {
        console.error('获取经办人列表失败:', error)
        this.$message.error('获取经办人列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.filteredAgentList = [...this.agentList]
        return
      }

      const keyword = this.searchKeyword.toLowerCase()
      this.filteredAgentList = this.agentList.filter(agent =>
        (agent.no && agent.no.toLowerCase().includes(keyword)) ||
        (agent.name && agent.name.toLowerCase().includes(keyword)) ||
        (agent.phone && agent.phone.includes(keyword)) ||
        (agent.accountName && agent.accountName.toLowerCase().includes(keyword))
      )
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchAgentList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedAgents = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedAgents = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedAgents.some(agent => agent.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断经办人是否可选
    isSelectable(row) {
      return !this.disabledAgents.includes(row.id)
    },

    // 移除已选择的经办人
    removeAgent(agent) {
      const index = this.selectedAgents.findIndex(a => a.id === agent.id)
      if (index > -1) {
        this.selectedAgents.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedAgents = []
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedAgents.length === 0) {
        this.$message.warning('请至少选择一个经办人')
        return
      }

      // 向父组件传递选中的经办人
      this.$emit('confirm', this.selectedAgents)
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
.agent-selector-dialog {
  // 确保经办人选择器弹窗在最顶层
  z-index: 3000 !important;

  .agent-selector {
    .search-container {
      margin-bottom: 20px;

      .search-input {
        width: 300px;
      }
    }

    .user-list-container {
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

    .selected-agents {
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
