<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
      <el-form-item label="商品名称">
        <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable style="width: 180px;" />
      </el-form-item>
      <el-form-item label="商品分类">
        <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable style="width: 180px;">
          <el-option
            v-for="category in categoryOptions"
            :key="category.id"
            :label="category.typeName"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
          <el-option label="上架" value="1" />
          <el-option label="下架" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增商品</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="商品名称" prop="goodsName" width="180" align="center" show-overflow-tooltip />
      <el-table-column label="分类" prop="typeName" width="120" align="center" />
      <el-table-column label="商品图片" width="100" align="center">
        <template #default="scope">
          <el-image
            v-if="scope.row.goodsImage"
            :src="displayUrl(scope.row.goodsImage)"
            style="width: 60px; height: 60px; object-fit: cover; cursor: pointer;"
            fit="cover"
            :preview-src-list="[displayUrl(scope.row.goodsImage)]"
          />
          <span v-else style="color: #909399;">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="所需积分" prop="pointPrice" width="100" align="center">
        <template #default="scope">
          <span style="color: #e6a23c; font-weight: 600;">{{ scope.row.pointPrice || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="stock" width="100" align="center">
        <template #default="scope">
          <span :class="scope.row.stock <= 10 ? 'low-stock' : ''">{{ scope.row.stock || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'info'" size="small">
            {{ scope.row.status === '1' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sortNum" width="80" align="center" sortable="custom" />
      <el-table-column label="创建时间" prop="createTime" width="180" align="center">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作"  fixed="right" align="center">
        <template #default="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          <el-button
            size="mini"
            :type="scope.row.status === '1' ? 'warning' : 'success'"
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === '1' ? '下架' : '上架' }}
          </el-button>
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
      width="800px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%;">
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.typeName"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="form.sort"
                :min="0"
                :step="1"
                placeholder="数字越大越靠前"
                style="width: 100%;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品图片" prop="image">
          <ImageUploader
            v-model="form.image"
            :multiple="false"
            :limit="1"
            tips="建议上传正方形图片，大小不超过2MB"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所需积分" prop="points">
              <el-input-number
                v-model="form.points"
                :min="1"
                :step="1"
                placeholder="请输入所需积分"
                style="width: 100%;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
                <el-option label="上架" value="1" />
                <el-option label="下架" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number
            v-model="form.stock"
            :min="0"
            :step="1"
            placeholder="请输入库存数量"
            style="width: 100%;"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="商品详情" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="6"
            placeholder="请输入商品详情"
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
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import ImageUploader from '@/components/ImageUploader'
import {
  getPointsGoodsPage,
  getPointsGoodsDetail,
  createPointsGoods,
  updatePointsGoods,
  deletePointsGoods,
  changePointsGoodsStatus,
  getPointsCategoryPage
} from '@/api/points'

const BASE_API = (import.meta.env.VITE_BASE_API || '/api').replace(/\/+$/, '')

export default {
  name: 'PointsGoods',
  components: {
    ImageUploader
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        categoryId: '',
        status: ''
      },
      // 列表数据
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      // 分类选项
      categoryOptions: [],
      // 对话框控制
      dialogVisible: false,
      dialogTitle: '新增商品',
      submitLoading: false,
      // 表单数据
      form: {
        id: '',
        name: '',
        categoryId: '',
        categoryName: '',
        image: '',
        points: null,
        stock: 0,
        status: '1',
        sort: 0,
        description: '',
        detail: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 1, max: 100, message: '商品名称长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ],
        points: [
          { required: true, message: '请输入所需积分', trigger: 'blur' },
          { type: 'number', min: 1, message: '所需积分必须大于0', trigger: 'blur' }
        ],
        stock: [
          { required: true, message: '请输入库存数量', trigger: 'blur' },
          { type: 'number', min: 0, message: '库存数量不能小于0', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchCategories()
    this.fetchData()
  },
  methods: {
    // 获取分类列表
    async fetchCategories() {
      try {
        const response = await getPointsCategoryPage({ pageNum: 1, pageSize: 1000, status: 1 })
        this.categoryOptions = response.data.records || []
      } catch (error) {
        console.error('获取分类列表失败:', error)
        this.categoryOptions = []
      }
    },

    // 获取数据
    async fetchData() {
      this.listLoading = true
      try {
        // 转换搜索参数为后端字段名
        const params = {
          goodsName: this.searchForm.name || undefined,
          typeId: this.searchForm.categoryId || undefined,
          status: this.searchForm.status || undefined,
          pageNum: this.listQuery.pageNum,
          pageSize: this.listQuery.pageSize
        }
        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        const response = await getPointsGoodsPage(params)
        const records = response.data.records || []
        // 为每个商品添加分类名称
        this.list = records.map(item => {
          const category = this.categoryOptions.find(c => c.id === item.typeId)
          return {
            ...item,
            categoryName: category ? category.name : ''
          }
        })
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取商品列表失败:', error)
        this.list = []
        this.total = 0
        this.$message.error('获取商品列表失败')
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
        name: '',
        categoryId: '',
        status: ''
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

    // 新增商品
    handleAdd() {
      this.dialogTitle = '新增商品'
      this.form = {
        id: '',
        name: '',
        categoryId: '',
        categoryName: '',
        image: '',
        points: null,
        stock: 0,
        status: '1',
        sort: 0,
        description: '',
        detail: ''
      }
      this.dialogVisible = true
    },

    // 编辑商品
    async handleEdit(row) {
      this.dialogTitle = '编辑商品'
      try {
        const response = await getPointsGoodsDetail(row.id)
        const data = response.data
        this.form = {
          id: data.id,
          name: data.goodsName || '',
          categoryId: data.typeId || '',
          categoryName: data.categoryName || '',
          image: data.goodsImage || '',
          points: data.pointPrice || null,
          stock: data.stock || 0,
          status: data.status || '1',
          sort: data.sortNum || 0,
          description: data.goodsDescription || '',
          detail: data.goodsDetail || ''
        }
        this.dialogVisible = true
      } catch (error) {
        console.error('获取商品详情失败:', error)
        this.$message.error('获取商品详情失败')
      }
    },

    // 删除商品
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该商品吗？删除后不可恢复！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deletePointsGoods(row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 上架/下架
    async handleToggleStatus(row) {
      const newStatus = row.status === '1' ? '0' : '1'
      const statusText = newStatus === '1' ? '上架' : '下架'
      try {
        await changePointsGoodsStatus(row.id, newStatus)
        this.$message.success(`${statusText}成功`)
        this.fetchData()
      } catch (error) {
        console.error(`${statusText}失败:`, error)
        this.$message.error(`${statusText}失败`)
      }
    },

    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          // 转换前端字段到后端字段
          const submitData = {
            id: this.form.id || undefined,
            typeId: this.form.categoryId,
            goodsName: this.form.name,
            goodsImage: this.form.image,
            goodsDescription: this.form.description,
            pointPrice: this.form.points,
            stock: this.form.stock,
            status: this.form.status,
            sortNum: this.form.sort,
            goodsDetail: this.form.detail || ''
          }

          this.submitLoading = true
          try {
            if (this.form.id) {
              await updatePointsGoods(submitData)
              this.$message.success('更新成功')
            } else {
              await createPointsGoods(submitData)
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
    },

    // 显示图片URL
    displayUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) {
        return url
      }
      return BASE_API + url
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

.low-stock {
  color: #f56c6c;
  font-weight: 600;
}
</style>
