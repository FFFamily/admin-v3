<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
      <el-form-item label="货物类型">
        <el-input v-model="searchForm.goodType" placeholder="请输入货物类型" />
      </el-form-item>
      <el-form-item label="货物名称">
        <el-input v-model="searchForm.goodName" placeholder="请输入货物名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增经营范围</el-button>
        <!-- <el-button type="danger" @click="handleBatchDelete">批量删除</el-button> -->
        <!-- <el-button type="success" @click="handleBatchAdd">批量导入</el-button> -->
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="no" width="80" align="center" />
      <el-table-column label="货物类型" prop="goodType" width="120" align="center" />
      <el-table-column label="货物名称" prop="goodName" width="150" align="center" />
      <el-table-column label="规格型号" prop="goodModel" width="150" align="center" />
      <el-table-column label="货物备注" prop="goodRemark" width="120" align="center" />
      <el-table-column label="公示价格" prop="publicPrice" width="120" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="是否显示" prop="isShow" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.isShow === 'Y' ? 'success' : 'danger'">{{ scope.row.isShow === 'Y' ? '显示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="mini" @click="handleUp(scope.row)">上移</el-button>
          <el-button size="mini" @click="handleDown(scope.row)">下移</el-button>
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" @click="handleView(scope.row)">{{ scope.row.isShow === 'Y' ? '隐藏' : '显示' }}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="pagination.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="编号" prop="no">
          <el-input v-model="form.no" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="货物类型" prop="goodType">
          <el-input v-model="form.goodType" placeholder="请输入货物类型" />
        </el-form-item>
        <el-form-item label="货物名称" prop="goodName">
          <el-input v-model="form.goodName" placeholder="请输入货物名称" />
        </el-form-item>
        <el-form-item label="规格型号" prop="goodModel">
          <el-input v-model="form.goodModel" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="货物备注" prop="goodRemark">
          <el-input v-model="form.goodRemark" placeholder="请输入货物备注" />
        </el-form-item>
        <el-form-item label="公示价格" prop="publicPrice">
          <el-input-number
            v-model="form.publicPrice"
            :precision="2"
            :min="0"
            :step="0.01"
            style="width: 100%"
            placeholder="请输入公示价格"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 经营范围选择器 -->
    <BusinessScopeSelector
      v-model:visible="showSelector"
      title="选择经营范围"
      @confirm="handleSelectorConfirm"
    />
  </div>
</template>

<script>
import {
  getBusinessScopePage,
  createBusinessScope,
  updateBusinessScope,
  deleteBusinessScope,
  batchDeleteBusinessScope,
  updateBusinessScopeVisible,
  moveUpBusinessScope,
  moveDownBusinessScope
} from '@/api/businessScope'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  name: 'BusinessScope',
  components: {
    BusinessScopeSelector
  },
  data() {
    return {
      // 列表数据
      list: [],
      listLoading: false,

      // 搜索表单
      searchForm: {
        goodType: '',
        goodName: '',
        goodModel: ''
      },

      // 分页
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },

      // 选中的行
      selectedIds: [],

      // 弹窗相关
      dialogVisible: false,
      dialogTitle: '',
      submitLoading: false,

      // 表单数据
      form: {
        id: null,
        goodType: '',
        goodName: '',
        goodModel: '',
        publicPrice: 0
      },

      // 表单验证规则
      rules: {
        no: [
          { required: true, message: '请输入编号', trigger: 'blur' }
        ],
        goodType: [
          { required: true, message: '请输入货物类型', trigger: 'blur' }
        ],
        goodName: [
          { required: true, message: '请输入货物名称', trigger: 'blur' }
        ],
        goodModel: [
          { required: true, message: '请输入规格型号', trigger: 'blur' }
        ],
        publicPrice: [
          { required: true, message: '请输入货物价格', trigger: 'blur' }
        ]
      },

      // 选择器相关
      showSelector: false
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    // 获取数据
    fetchData() {
      this.listLoading = true
      const params = {
        goodType: this.searchForm.goodType || undefined,
        goodName: this.searchForm.goodName || undefined,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }

      getBusinessScopePage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleUp(row) {
      moveUpBusinessScope(row.id).then(() => {
        this.$message.success('上移成功')
        this.fetchData()
      })
    },
    handleDown(row) {
      moveDownBusinessScope(row.id).then(() => {
        this.$message.success('下移成功')
        this.fetchData()
      })
    },
    handleView(row) {
      updateBusinessScopeVisible(row.id, row.isShow === 'Y' ? 'N' : 'Y').then(() => {
        this.$message.success('操作成功')
        this.fetchData()
      })
    },
    // 搜索
    handleSearch() {
      this.pagination.pageNum = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        goodType: '',
        goodName: '',
        goodModel: ''
      }
      this.pagination.pageNum = 1
      this.fetchData()
    },

    // 新增
    handleAdd() {
      this.dialogTitle = '新增经营范围'
      this.form = {
        id: null,
        goodType: '',
        goodName: '',
        goodModel: '',
        publicPrice: 0
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },

    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑经营范围'
      this.form = { ...row }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const submitData = { ...this.form }

          const request = this.form.id
            ? updateBusinessScope(this.form.id, submitData)
            : createBusinessScope(submitData)

          request.then(() => {
            this.$message.success(this.form.id ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.fetchData()
          }).catch(() => {
            this.$message.error(this.form.id ? '更新失败' : '新增失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该经营范围吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteBusinessScope(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },

    // 批量删除
    handleBatchDelete() {
      this.$confirm(`确定要删除选中的 ${this.selectedIds.length} 条记录吗？`, '提示', { type: 'warning' })
        .then(() => {
          batchDeleteBusinessScope(this.selectedIds).then(() => {
            this.$message.success('批量删除成功')
            this.selectedIds = []
            this.fetchData()
          }).catch(() => {
            this.$message.error('批量删除失败')
          })
        })
        .catch(() => {})
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id)
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.pageNum = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.fetchData()
    },

    // 选择器确认
    handleSelectorConfirm(selectedItems) {
      this.$message.success(`成功选择 ${selectedItems.length} 项经营范围`)
      console.log('选中的经营范围:', selectedItems)
      // 这里可以根据需要处理选中的经营范围
      // 例如：添加到当前列表、进行批量操作等
    },
    // 点击批量导入时
    handleBatchAdd() {
      alert('功能开发中')
    }
  }
}
</script>

<style scoped>
.search-form .el-form-item {
  margin-right: 20px;
}

.operation-container {
  margin: 20px 0;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.dialog-footer {
  text-align: right;
}
</style>
