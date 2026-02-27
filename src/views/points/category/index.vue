<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>积分商品分类管理</span>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增分类</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分类名称">
          <el-input v-model="searchForm.typeName" placeholder="请输入分类名称" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
        <el-table-column label="分类名称" prop="typeName" width="200" align="center" show-overflow-tooltip />
        <el-table-column label="排序" prop="sortNum" width="100" align="center" sortable="custom" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'info'" size="small">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="description" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
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

      <!-- 新增/编辑对话框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
        @close="handleDialogClose"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="分类名称" prop="typeName">
            <el-input v-model="form.typeName" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNum">
            <el-input-number
              v-model="form.sortNum"
              :min="0"
              :step="1"
              placeholder="数字越大越靠前"
              style="width: 100%;"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="1">启用</el-radio>
              <el-radio label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入分类描述"
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
    </el-card>
  </div>
</template>

<script>
import {
  getPointsCategoryPage,
  getPointsCategoryDetail,
  createPointsCategory,
  updatePointsCategory,
  deletePointsCategory
} from '@/api/points'

export default {
  name: 'PointsCategory',
  data() {
    return {
      // 搜索表单
      searchForm: {
        typeName: ''
      },
      // 列表数据
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      // 对话框控制
      dialogVisible: false,
      dialogTitle: '新增分类',
      submitLoading: false,
      // 表单数据
      form: {
        id: '',
        typeName: '',
        sortNum: 0,
        status: '1',
        description: ''
      },
      // 表单验证规则
      rules: {
        typeName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        sortNum: [
          { type: 'number', min: 0, message: '排序值不能小于0', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
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
        const response = await getPointsCategoryPage(params)
        this.list = response.data.records || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取分类列表失败:', error)
        this.list = []
        this.total = 0
        this.$message.error('获取分类列表失败')
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
        typeName: ''
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

    // 新增分类
    handleAdd() {
      this.dialogTitle = '新增分类'
      this.form = {
        id: '',
        typeName: '',
        sortNum: 0,
        status: '1',
        description: ''
      }
      this.dialogVisible = true
    },

    // 编辑分类
    async handleEdit(row) {
      this.dialogTitle = '编辑分类'
      try {
        const response = await getPointsCategoryDetail(row.id)
        this.form = {
          id: response.data.id,
          typeName: response.data.typeName || '',
          sortNum: response.data.sortNum || 0,
          status: response.data.status !== undefined ? String(response.data.status) : '1',
          description: response.data.description || ''
        }
        this.dialogVisible = true
      } catch (error) {
        console.error('获取分类详情失败:', error)
        this.$message.error('获取分类详情失败')
      }
    },

    // 删除分类
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该分类吗？删除后不可恢复！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deletePointsCategory(row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            // 构建提交数据，确保字段名称正确
            const submitData = {
              id: this.form.id || undefined,
              typeName: this.form.typeName,
              sortNum: this.form.sortNum,
              status: this.form.status,
              description: this.form.description
            }
            if (this.form.id) {
              await updatePointsCategory(submitData)
              this.$message.success('更新成功')
            } else {
              await createPointsCategory(submitData)
              this.$message.success('创建成功')
            }
            this.dialogVisible = false
            this.fetchData()
          } catch (error) {
            console.error('提交失败:', error)
            this.$message.error('提交失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    // 对话框关闭
    handleDialogClose() {
      this.$refs.form && this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 15px;
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>
