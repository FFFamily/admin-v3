<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="站点名称">
        <el-input v-model="queryParams.name" placeholder="请输入站点名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="siteList" border>
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column prop="name" label="站点名称" align="center" />
      <el-table-column prop="address" label="站点地址" align="center" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="queryParams.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="queryParams.size"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="handleDialogClose">
      <el-form ref="siteForm" :model="siteForm" :rules="siteRules" label-width="100px">
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="siteForm.name" placeholder="请输入站点名称" />
        </el-form-item>
        <el-form-item label="站点地址" prop="address">
          <el-input v-model="siteForm.address" placeholder="请输入站点地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getSiteListPage, createSite, updateSite, deleteSite } from '@/api/site'

export default {
  name: 'Site',
  data() {
    return {
      loading: false,
      submitLoading: false,
      siteList: [],
      total: 0,
      queryParams: {
        page: 1,
        size: 10,
        name: ''
      },
      dialogVisible: false,
      dialogTitle: '',
      siteForm: {
        id: null,
        name: '',
        address: ''
      },
      siteRules: {
        name: [
          { required: true, message: '请输入站点名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入站点地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const response = await getSiteListPage(this.queryParams)
        this.siteList = response.data.records || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取站点列表失败:', error)
        this.$message.error('获取站点列表失败')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.page = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        size: 10,
        name: ''
      }
      this.fetchList()
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.fetchList()
    },
    handleAdd() {
      this.dialogTitle = '新增站点'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑站点'
      this.siteForm = {
        id: row.id,
        name: row.name,
        address: row.address
      }
      this.dialogVisible = true
    },
    handleDialogClose() {
      this.siteForm = {
        id: null,
        name: '',
        address: ''
      }
      if (this.$refs.siteForm) {
        this.$refs.siteForm.clearValidate()
      }
    },
    async handleSubmit() {
      if (!this.$refs.siteForm) return

      this.$refs.siteForm.validate(async(valid) => {
        if (!valid) return false

        this.submitLoading = true
        try {
          if (this.siteForm.id) {
            await updateSite(this.siteForm)
            this.$message.success('编辑成功')
          } else {
            await createSite(this.siteForm)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('操作失败:', error)
          this.$message.error('操作失败')
        } finally {
          this.submitLoading = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该站点吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteSite(row.id)
          this.$message.success('删除成功')
          this.fetchList()
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 20px;
}

.mb8 {
  margin-bottom: 8px;
}
</style>
