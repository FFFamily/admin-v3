<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
      <el-form-item label="账户">
        <el-input
          v-model="searchForm.accountName"
          placeholder="请选择账户"
          readonly
          style="width: 300px;"
          clearable
          @clear="handleClearAccount"
          @click="showUserSelector"
        >
          <template #append>
            <el-button icon="el-icon-search" @click="showUserSelector" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="warning" icon="el-icon-edit" @click="handleAdjustPoints">积分调整</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="账户名称" prop="accountName" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="积分类型" prop="changeType" width="120" align="center">
        <template #default="scope">
          {{ getPointsTypeText(scope.row.changeType) }}
        </template>
      </el-table-column>
      <el-table-column label="变更方向" prop="changeDirection" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.changeDirection === 'add' ? 'success' : 'danger'" size="small">
            {{ scope.row.changeDirection === 'add' ? '增加' : '减少' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="变更数量" prop="changePoint" width="120" align="center">
        <template #default="scope">
          <span :class="scope.row.changeDirection === 'add' ? 'income-points' : 'expense-points'">
            {{ scope.row.changeDirection === 'add' ? '+' : '-' }}{{ scope.row.changePoint || 0 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变更时间" prop="createTime" width="170" align="center">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="变更原因" prop="changeReason" width="150" align="center" show-overflow-tooltip />

      <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-show="total > 0"
      :current-page="listQuery.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="listQuery.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 用户选择器（搜索用） -->
    <UserSelector
      v-model:visible="userSelectorVisible"
      title="选择用户"
      :multiple="false"
      @confirm="handleUserConfirm"
      @close="handleUserClose"
    />

    <!-- 积分调整对话框 -->
    <el-dialog
      title="积分调整"
      v-model="adjustDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleAdjustDialogClose"
    >
      <el-form ref="adjustForm" :model="adjustForm" :rules="adjustRules" label-width="120px">
        <el-form-item label="选择账户" prop="accountId">
          <el-input
            v-model="adjustForm.accountName"
            placeholder="请选择账户"
            readonly
            style="width: 100%;"
            @click="showAdjustUserSelector"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="showAdjustUserSelector" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="操作类型" prop="changeDirection">
          <el-radio-group v-model="adjustForm.changeDirection">
            <el-radio label="add">添加积分</el-radio>
            <el-radio label="sub">减少积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分数" prop="changePoint">
          <el-input-number
            v-model="adjustForm.changePoint"
            :precision="0"
            :min="1"
            :step="1"
            placeholder="请输入积分数"
            style="width: 100%;"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="变更原因" prop="changeReason">
          <el-input
            v-model="adjustForm.changeReason"
            placeholder="请输入变更原因"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="adjustForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="adjustSubmitLoading" @click="handleAdjustSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 积分调整用户选择器 -->
    <UserSelector
      v-model:visible="adjustUserSelectorVisible"
      title="选择用户"
      :multiple="false"
      @confirm="handleAdjustUserConfirm"
      @close="handleAdjustUserClose"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import UserSelector from '@/components/UserSelector'
import { getPointsDetailPage, exportPointsDetail, adjustPoints } from '@/api/points'
import { POINTS_CHANGE_TYPE_OPTIONS, getPointsChangeTypeText } from '@/constants/points'

export default {
  name: 'PointsDetail',
  components: {
    UserSelector
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        changeType: '',
        changeDirection: '',
        accountId: '',
        accountName: '',
        dateRange: []
      },
      // 列表数据
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      // 用户选择器控制
      userSelectorVisible: false,
      // 积分调整对话框控制
      adjustDialogVisible: false,
      adjustSubmitLoading: false,
      adjustUserSelectorVisible: false,
      // 积分调整表单
      adjustForm: {
        accountId: '',
        accountName: '',
        changeDirection: 'add', // add: 添加积分, sub: 减少积分
        changePoint: null,
        changeType: 'system_adjust', // 系统调整
        changeReason: '',
        remark: ''
      },
      // 积分调整表单验证规则
      adjustRules: {
        accountId: [{ required: true, message: '请选择账户', trigger: 'change' }],
        changeDirection: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
        changePoint: [
          { required: true, message: '请输入积分数', trigger: 'blur' },
          { type: 'number', min: 1, message: '积分数必须大于0', trigger: 'blur' }
        ]
      },
      // 积分类型选项（变更类型）
      pointsTypeOptions: POINTS_CHANGE_TYPE_OPTIONS
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    async fetchData() {
      this.listLoading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.listQuery.pageNum,
          pageSize: this.listQuery.pageSize
        }

        // 处理日期范围
        if (params.dateRange && params.dateRange.length === 2) {
          params.startDate = params.dateRange[0]
          params.endDate = params.dateRange[1]
        }
        delete params.dateRange

        const response = await getPointsDetailPage(params)
        this.list = response.data.records || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取积分明细失败:', error)
        this.list = []
        this.total = 0
        this.$message.error('获取积分明细失败')
      } finally {
        this.listLoading = false
      }
    },

    // 搜索
    handleSearch() {
      this.listQuery.pageNum = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        changeType: '',
        changeDirection: '',
        accountId: '',
        accountName: '',
        dateRange: []
      }
      this.listQuery.pageNum = 1
      this.fetchData()
    },

    // 分页相关
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.fetchData()
    },

    // 显示用户选择器
    showUserSelector() {
      this.userSelectorVisible = true
    },

    // 用户选择确认
    handleUserConfirm(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.searchForm.accountId = user.id
        this.searchForm.accountName = user.nickname || user.username
      }
      this.userSelectorVisible = false
    },

    // 用户选择器关闭
    handleUserClose() {
      this.userSelectorVisible = false
    },

    // 清除账户选择
    handleClearAccount() {
      this.searchForm.accountId = ''
      this.searchForm.accountName = ''
    },

    // 获取积分类型文本
    getPointsTypeText(type) {
      return getPointsChangeTypeText(type)
    },

    // 导出数据
    async handleExport() {
      try {
        const params = {
          ...this.searchForm
        }

        // 处理日期范围
        if (params.dateRange && params.dateRange.length === 2) {
          params.startDate = params.dateRange[0]
          params.endDate = params.dateRange[1]
        }
        delete params.dateRange

        const response = await exportPointsDetail(params)
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `用户积分明细_${new Date().toISOString().split('T')[0]}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      }
    },

    // 积分调整相关方法
    handleAdjustPoints() {
      this.adjustDialogVisible = true
    },

    // 显示积分调整用户选择器
    showAdjustUserSelector() {
      this.adjustUserSelectorVisible = true
    },

    // 积分调整用户选择确认
    handleAdjustUserConfirm(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.adjustForm.accountId = user.id
        this.adjustForm.accountName = user.nickname || user.username
      }
      this.adjustUserSelectorVisible = false
    },

    // 积分调整用户选择器关闭
    handleAdjustUserClose() {
      this.adjustUserSelectorVisible = false
    },

    // 积分调整对话框关闭
    handleAdjustDialogClose() {
      this.$refs.adjustForm && this.$refs.adjustForm.resetFields()
      this.adjustForm = {
        accountId: '',
        accountName: '',
        changeDirection: 'add',
        changePoint: null,
        changeType: 'system_adjust',
        changeReason: '',
        remark: ''
      }
    },

    // 提交积分调整
    async handleAdjustSubmit() {
      this.$refs.adjustForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.adjustSubmitLoading = true
        try {
          const submitData = {
            accountId: this.adjustForm.accountId,
            changeDirection: this.adjustForm.changeDirection, // add 或 sub
            changePoint: this.adjustForm.changePoint,
            changeType: this.adjustForm.changeType, // 系统调整
            changeReason: this.adjustForm.changeReason || '系统调整',
            remark: this.adjustForm.remark || ''
          }

          await adjustPoints(submitData)
          this.$message.success(this.adjustForm.changeDirection === 'add' ? '添加积分成功' : '减少积分成功')
          this.adjustDialogVisible = false
          // 刷新列表
          this.fetchData()
        } catch (error) {
          console.error('积分调整失败:', error)
          this.$message.error('积分调整失败，请稍后重试')
        } finally {
          this.adjustSubmitLoading = false
        }
      })
    },

    // 工具方法
    formatDateTime(time) {
      return parseTime(time)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-form {
  .el-form-item {
    margin-bottom: 15px;
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.income-points {
  color: #67c23a;
  font-weight: 600;
}

.expense-points {
  color: #f56c6c;
  font-weight: 600;
}

// 响应式设计
@media (max-width: 768px) {
  .search-form {
    .el-form-item {
      display: block;
      margin-bottom: 15px;

      .el-form-item__label {
        display: block;
        text-align: left;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
