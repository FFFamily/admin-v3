<template>
  <div class="categories-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <el-button type="primary" size="mini" @click="handleAdd">
            <i class="el-icon-plus" /> 新增分类
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="分类编码">
          <el-input v-model="searchForm.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="searchForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="listLoading" :data="categoryList" style="width: 100%" border>
        <el-table-column prop="code" label="分类编码" width="180" />
        <el-table-column prop="name" label="分类名称" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="categoryForm" :model="categoryForm" :rules="categoryRules">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCategoriesListPage, saveCategory, deleteCategory, updateCategory } from '@/api/leaseGood'

export default {
  name: 'CategoriesManagement',
  data() {
    return {
      searchForm: {
        name: '',
        code: ''
      },
      categoryList: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      listLoading: false,
      dialogVisible: false,
      dialogTitle: '新增分类',
      categoryForm: {
        id: '',
        name: '',
        code: ''
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入分类编码', trigger: 'blur' },
          { min: 1, max: 50, message: '分类编码长度在 1 到 50 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '只能输入数字和字母', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchForm.name,
        code: this.searchForm.code
      }
      getCategoriesListPage(params)
        .then(response => {
          this.categoryList = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
        .catch(error => {
          console.error('获取分类列表失败:', error)
          this.listLoading = false
        })
    },

    handleSearch() {
      this.currentPage = 1
      this.getList()
    },
    resetForm() {
      this.searchForm = {
        name: '',
        code: ''
      }
      this.getList()
    },
    handleAdd() {
      this.dialogTitle = '新增分类'
      this.categoryForm = {
        id: '',
        name: '',
        code: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑分类'
      this.categoryForm = {
        id: row.id,
        name: row.name,
        code: row.code
      }
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.categoryForm.validate(valid => {
        if (valid) {
          const formData = {
            ...this.categoryForm,
            parentId: 0, // 固定为顶级分类
            sort: 0, // 默认排序值
            status: 1 // 默认启用状态
          }
          if (this.categoryForm.id) {
            updateCategory(formData)
              .then(response => {
                this.$message.success('操作成功')
                this.dialogVisible = false
                this.getList()
              })
              .catch(error => {
                console.error('更新分类失败:', error)
                this.$message.error('操作失败')
              })
          } else {
            saveCategory(formData)
              .then(response => {
                this.$message.success('操作成功')
                this.dialogVisible = false
                this.getList()
              })
              .catch(error => {
                console.error('保存分类失败:', error)
                this.$message.error('操作失败')
              })
          }
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCategory(row.id)
          .then(response => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(error => {
            console.error('删除分类失败:', error)
            this.$message.error('删除失败')
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.getList()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getList()
    }
  }
}
</script>

<style scoped>
.categories-management {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
