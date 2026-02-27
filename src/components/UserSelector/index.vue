<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    class="user-selector-dialog"
  >
    <div class="user-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="用户账号" prop="username">
          <el-input
            v-model="searchParams.username"
            placeholder="请输入用户账号、昵称搜索"
            class="search-input"
            clearable
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户名称" prop="nickname">
          <el-input
            v-model="searchParams.nickname"
            placeholder="请输入用户名称搜索"
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

      <!-- 用户列表 -->
      <el-table
        :data="filteredUserList"
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

        <!-- 用户账号列 -->
        <el-table-column prop="username" label="用户账号" min-width="120" />

        <!-- 用户名称列 -->
        <el-table-column prop="nickname" label="用户名称" min-width="120" />

        <!-- 用户类型列 -->
        <el-table-column prop="useType" label="用户类型" width="200" align="center">
          <template #default="scope">
            <el-tag type="info" size="mini">
              {{ useTypeText(scope.row.type || scope.row.accountTypeId) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'use' ? 'success' : 'danger'" size="mini">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 已选择用户展示 -->
      <div v-if="multiple && selectedUsers.length > 0" class="selected-users">
        <div class="selected-title">
          <span>已选择用户 ({{ selectedUsers.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="user in selectedUsers"
            :key="user.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeUser(user)"
          >
            {{ user.username }} - {{ user.nickname }}
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
import { getUserPage } from '@/api/user'
import { getAccountTypeList } from '@/api/accountType'

export default {
  name: 'UserSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择用户'
    },
    // 弹框宽度
    width: {
      type: String,
      default: '800px'
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
      default: 5
    },
    // 默认选中的用户ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的用户ID数组
    disabledUsers: {
      type: Array,
      default: () => []
    },
    // 业务类型过滤（supplier: 供应商, service_provider: 服务商）
    businessType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      userList: [],
      filteredUserList: [],
      selectedUsers: [],
      searchKeyword: '',
      searchParams: {
        username: '',
        nickname: ''
      },
      currentPage: 1,
      total: 0,
      searchForm: {},
      loading: false,
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      accountTypes: [] // 账号类型列表
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
        return this.selectedUsers.length > 0
      } else {
        return this.selectedUsers.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedUsers.length})`
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
        this.selectedUsers = [...newVal]
      },
      immediate: true
    },
    businessType() {
      // 当业务类型变化时，如果弹窗已打开，重新加载数据
      if (this.visible) {
        this.initData()
      }
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchKeyword = ''
      this.currentPage = 1
      await this.fetchAccountTypes()
      await this.fetchUserList()
    },

    // 获取账号类型列表
    async fetchAccountTypes() {
      try {
        const response = await getAccountTypeList()
        if (response && response.data) {
          this.accountTypes = response.data || []
        }
      } catch (error) {
        console.error('获取账号类型列表失败:', error)
      }
    },

    // 获取用户列表
    async fetchUserList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 如果传入了业务类型，添加到查询参数中
        if (this.businessType) {
          params.businessType = this.businessType
        }

        const response = await getUserPage(params)
        if (response && response.data) {
          this.userList = response.data.records || []
          this.total = response.data.total || 0
        }
        this.filteredUserList = [...this.userList]
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      // 搜索时重置页码到第一页
      this.currentPage = 1

      const params = {
        ...this.searchParams,
        pageNum: this.currentPage,
        pageSize: this.pageSize
      }
      
      // 如果传入了业务类型，添加到查询参数中
      if (this.businessType) {
        params.businessType = this.businessType
      }

      getUserPage(params).then(res => {
        if (res && res.data) {
          this.userList = res.data.records || []
          this.total = res.data.total || 0
        }
        this.filteredUserList = [...this.userList]
      }).catch(err => {
        console.error('搜索用户失败:', err)
        this.$message.error('搜索用户失败')
      })
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchUserList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedUsers = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedUsers = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedUsers.some(user => user.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断用户是否可选
    isSelectable(row) {
      return !this.disabledUsers.includes(row.id)
    },

    // 移除已选择的用户
    removeUser(user) {
      const index = this.selectedUsers.findIndex(u => u.id === user.id)
      if (index > -1) {
        this.selectedUsers.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedUsers = []
    },

    // 用户类型文本转换
    useTypeText(accountTypeId) {
      if (!accountTypeId) return '未知'
      // 根据账号类型ID查找对应的类型名称
      const accountType = this.accountTypes.find(item => item.id === accountTypeId)
      return accountType ? accountType.typeName : '未知'
    },

    // 状态文本转换
    statusText(status) {
      if (status === 'use') return '正常'
      if (status === 'disable') return '禁用'
      return '未知'
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请至少选择一个用户')
        return
      }

      // 向父组件传递选中的用户
      this.$emit('confirm', this.selectedUsers)
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
.user-selector-dialog {
  // 确保用户选择器弹窗在最顶层
  z-index: 3000 !important;

  .user-selector {
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

    .selected-users {
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
