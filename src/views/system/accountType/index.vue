<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.prevent>
      <el-form-item>
        <el-button type="primary" @click="handleAdd">新增账号类型</el-button>
      </el-form-item>
    </el-form>

    <!-- 账号类型表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="编号" prop="code" width="150" />
      <el-table-column label="账号类型" prop="typeName" />
      <el-table-column label="创建时间" prop="createTime" width="180" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="账号类型" prop="name">
          <el-input v-model="form.typeName" placeholder="请输入账号类型名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getAccountTypePage, addAccountType, updateAccountType, deleteAccountType } from '@/api/accountType'

export default {
  name: 'AccountType',
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        code: '',
        typeName: ''
      },
      dialogVisible: false,
      dialogTitle: '新增账号类型',
      form: {
        id: null,
        code: '',
        typeName: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        code: [
          { required: true, message: '请输入编号', trigger: 'blur' },
          { min: 2, max: 20, message: '编号长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        typeName: [
          { required: true, message: '请输入账号类型名称', trigger: 'blur' },
          { min: 2, max: 50, message: '账号类型名称长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {
        code: this.searchForm.code || undefined,
        typeName: this.searchForm.typeName || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getAccountTypePage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { code: '', typeName: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增账号类型'
      this.form = {
        id: null,
        code: '',
        typeName: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑账号类型'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该账号类型吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteAccountType(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            // 编辑
            updateAccountType(this.form).then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('编辑失败')
            })
          } else {
            // 新增
            addAccountType(this.form).then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('新增失败')
            })
          }
        }
      })
    },
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style>
