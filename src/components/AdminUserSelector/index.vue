<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    append-to-body
    class="admin-user-selector-dialog"
  >
    <div class="admin-user-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="登录账号" prop="username">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入登录账号搜索"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入用户昵称搜索"
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

      <!-- 后台用户列表 -->
      <el-table
        v-loading="loading"
        :data="filteredAdminUserList"
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

        <!-- 登录账号列 -->
        <el-table-column prop="username" label="登录账号" min-width="120" />

        <!-- 用户昵称列 -->
        <el-table-column prop="nickname" label="用户昵称" min-width="120" />

        <!-- 手机号列 -->
        <el-table-column prop="phone" label="手机号" min-width="120" />

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'use' ? 'success' : 'danger'">
              {{ scope.row.status === 'use' ? '使用中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 头像列 -->
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" size="small" />
            <el-avatar v-else icon="el-icon-user" size="small" />
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

      <!-- 已选择后台用户展示 -->
      <div v-if="multiple && selectedAdminUsers.length > 0" class="selected-admin-users">
        <div class="selected-title">
          <span>已选择后台用户 ({{ selectedAdminUsers.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="adminUser in selectedAdminUsers"
            :key="adminUser.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeAdminUser(adminUser)"
          >
            {{ adminUser.nickname }} - {{ adminUser.username }}
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
import { getAdminUserPage } from '@/api/adminUser'

export default {
  name: 'AdminUserSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择后台用户'
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
    // 默认选中的后台用户ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的后台用户ID数组
    disabledAdminUsers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      adminUserList: [],
      filteredAdminUserList: [],
      selectedAdminUsers: [],
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
        return this.selectedAdminUsers.length > 0
      } else {
        return this.selectedAdminUsers.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedAdminUsers.length})`
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
        this.selectedAdminUsers = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchKeyword = ''
      this.currentPage = 1
      await this.fetchAdminUserList()
    },

    // 获取后台用户列表
    async fetchAdminUserList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }

        const response = await getAdminUserPage(params)
        if (response && response.data) {
          this.adminUserList = response.data.records || response.data || []
          this.total = response.data.total || 0
        }
        this.filteredAdminUserList = [...this.adminUserList]
      } catch (error) {
        console.error('获取后台用户列表失败:', error)
        this.$message.error('获取后台用户列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.filteredAdminUserList = [...this.adminUserList]
        return
      }

      const keyword = this.searchKeyword.toLowerCase()
      this.filteredAdminUserList = this.adminUserList.filter(adminUser =>
        (adminUser.username && adminUser.username.toLowerCase().includes(keyword)) ||
        (adminUser.nickname && adminUser.nickname.toLowerCase().includes(keyword)) ||
        (adminUser.phone && adminUser.phone.includes(keyword))
      )
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchAdminUserList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedAdminUsers = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedAdminUsers = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedAdminUsers.some(adminUser => adminUser.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断后台用户是否可选
    isSelectable(row) {
      return !this.disabledAdminUsers.includes(row.id)
    },

    // 移除已选择的后台用户
    removeAdminUser(adminUser) {
      const index = this.selectedAdminUsers.findIndex(a => a.id === adminUser.id)
      if (index > -1) {
        this.selectedAdminUsers.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedAdminUsers = []
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedAdminUsers.length === 0) {
        this.$message.warning('请至少选择一个后台用户')
        return
      }

      // 向父组件传递选中的后台用户
      this.$emit('confirm', this.selectedAdminUsers)
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
.admin-user-selector-dialog {
  // 确保后台用户选择器弹窗在最顶层
  z-index: 3000 !important;

  .admin-user-selector {
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

    .selected-admin-users {
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
