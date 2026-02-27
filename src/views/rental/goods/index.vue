<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.prevent>
      <el-form-item label="商品名">
        <el-input v-model="searchForm.name" placeholder="请输入商品名" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="上架" value="up" />
          <el-option label="下架" value="down" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="编号" prop="code" width="120" align="center" sortable />
      <el-table-column label="分类" width="120" align="center">
        <template #default="scope">
          {{ scope.row.typeName || '未分类' }}
        </template>
      </el-table-column>
      <el-table-column label="商品名" prop="name" sortable />
      <el-table-column label="图片" width="100" align="center">
        <template #default="scope">
          <el-image
            :src="displayUrl(scope.row.image)"
            style="width:60px;height:60px;object-fit:cover;"
            :preview-src-list="[displayUrl(scope.row.image)]"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="价格(元/天)" prop="price" width="100" align="center" sortable />
      <el-table-column label="使用年限" prop="useLimitYear" width="100" align="center" sortable />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'up' ? 'success' : 'info'">
            {{ scope.row.status === 'up' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="mini" type="warning" @click="handleToggleStatus(scope.row)">
            {{ scope.row.status === 'up' ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <div class="pagination-container" style="margin-top: 20px;">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 图片预览弹窗 -->
    <el-dialog v-model="dialogImageVisible" title="预览图片" :close-on-click-modal="false">
      <img :src="previewImage" alt="预览图片" style="max-width: 100%;">
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入商品编号" />
        </el-form-item>
        <el-form-item label="图片">
          <ImageUploader
            v-model="form.image"
            :multiple="false"
            :limit="1"
            @preview="handlePictureCardPreview"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="上架" value="up" />
            <el-option label="下架" value="down" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="type">
          <el-select v-model="form.type" placeholder="请选择分类">
            <el-option v-for="category in categoryOptions" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="基本信息">
          <el-input v-model="form.baseInfo" type="textarea" placeholder="请输入基本信息" />
        </el-form-item>
        <el-form-item label="使用年限">
          <el-input-number v-model="form.useLimitYear" :min="0" placeholder="请输入使用年限" />
        </el-form-item>
        <el-form-item label="设备参数">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <el-radio v-model="form.dynamicFields.parameter.type" label="text">文字</el-radio>
            <el-radio v-model="form.dynamicFields.parameter.type" label="image" style="margin-left: 20px;">图片</el-radio>
          </div>
          <div v-if="form.dynamicFields.parameter.type === 'text'">
            <el-input
              v-model="form.dynamicFields.parameter.data"
              type="textarea"
              :rows="4"
              placeholder="请输入设备参数，支持换行"
            />
          </div>
          <div v-else>
            <ImageUploader
              v-model="form.dynamicFields.parameter.images"
              :multiple="true"
              :limit="5"
              tips="最多上传5张图片，每张不超过2MB"
              @preview="handlePictureCardPreview"
            />
          </div>
        </el-form-item>
        <el-form-item label="服务内容">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <el-radio v-model="form.dynamicFields.serviceContent.type" label="text">文字</el-radio>
            <el-radio v-model="form.dynamicFields.serviceContent.type" label="image" style="margin-left: 20px;">图片</el-radio>
          </div>
          <div v-if="form.dynamicFields.serviceContent.type === 'text'">
            <el-input
              v-model="form.dynamicFields.serviceContent.data"
              type="textarea"
              :rows="4"
              placeholder="请输入服务内容，支持换行"
            />
          </div>
          <div v-else>
            <ImageUploader
              v-model="form.dynamicFields.serviceContent.images"
              :multiple="true"
              :limit="5"
              tips="最多上传5张图片，每张不超过2MB"
              @preview="handlePictureCardPreview"
            />
          </div>
        </el-form-item>
        <el-form-item label="注意事项">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <el-radio v-model="form.dynamicFields.precaution.type" label="text">文字</el-radio>
            <el-radio v-model="form.dynamicFields.precaution.type" label="image" style="margin-left: 20px;">图片</el-radio>
          </div>
          <div v-if="form.dynamicFields.precaution.type === 'text'">
            <el-input
              v-model="form.dynamicFields.precaution.data"
              type="textarea"
              :rows="4"
              placeholder="请输入注意事项，支持换行"
            />
          </div>
          <div v-else>
            <ImageUploader
              v-model="form.dynamicFields.precaution.images"
              :multiple="true"
              :limit="5"
              tips="最多上传5张图片，每张不超过2MB"
              @preview="handlePictureCardPreview"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCategoriesList, changeGoodStatus, getLeaseGoodListPage, addLeaseGood, updateLeaseGood, deleteLeaseGood } from '@/api/leaseGood'
import ImageUploader from '@/components/ImageUploader'
export default {
  components: { ImageUploader },
  data() {
    return {
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      listLoading: false,
      searchForm: {
        name: '',
        status: ''
      },
      dialogVisible: false,
      dialogTitle: '新增商品',
      form: {
        id: null,
        name: '',
        code: '',
        image: '',
        price: 0,
        status: 'up',
        type: '',
        categoryId: '',
        baseInfo: '',
        useLimitYear: 0,
        // 优化后的动态字段结构
        dynamicFields: {
          parameter: {
            type: 'text',
            data: '',
            images: []
          },
          serviceContent: {
            type: 'text',
            data: '',
            images: []
          },
          precaution: {
            type: 'text',
            data: '',
            images: []
          }
        }
      },
      categoryOptions: [], // 分类选项

      // 图片预览相关
      previewImage: '',
      dialogImageVisible: false,

      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入商品编号', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9-]+$/, message: '商品编号只能包含字母、数字和连字符', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ],
        useLimitYear: [
          { type: 'number', min: 0, max: 50, message: '使用年限必须在0-50年之间', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    baseUrl() {
      return import.meta.env.VITE_API_BASE_URL || ''
    }
  },

  watch: {
    // 监听动态字段类型变化，清空对应的数据
    'form.dynamicFields.parameter.type'(newType) {
      if (newType === 'text') {
        this.form.dynamicFields.parameter.images = []
      } else {
        this.form.dynamicFields.parameter.data = ''
      }
    },
    'form.dynamicFields.serviceContent.type'(newType) {
      if (newType === 'text') {
        this.form.dynamicFields.serviceContent.images = []
      } else {
        this.form.dynamicFields.serviceContent.data = ''
      }
    },
    'form.dynamicFields.precaution.type'(newType) {
      if (newType === 'text') {
        this.form.dynamicFields.precaution.images = []
      } else {
        this.form.dynamicFields.precaution.data = ''
      }
    }
  },
  created() {
    this.fetchData()
    this.getCategoryOptions()
  },
  methods: {
    displayUrl(raw) {
      if (!raw) return ''
      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(raw) || /^data:/i.test(raw)
      if (isAbsolute) return raw
      const base = (this.baseUrl || '').replace(/\/$/, '')
      const path = String(raw).startsWith('/') ? raw : `/${raw}`
      return `${base}${path}`
    },

    getCategoryOptions() {
      getCategoriesList()
        .then(response => {
          this.categoryOptions = response.data || []
        })
        .catch(error => {
          console.error('获取分类失败:', error)
          this.$message.error('获取分类失败')
        })
    },
    fetchData() {
      this.listLoading = true
      // 调用API获取商品列表
      console.log(this.searchForm)
      getLeaseGoodListPage({
        pageNum: this.currentPage,
        pageSize: this.pageSize
      }, this.searchForm)
        .then(response => {
          this.list = response.data.records || []
          this.total = response.data.total || 0
          this.listLoading = false
        })
        .catch(error => {
          console.error('获取商品列表失败:', error)
          this.$message.error('获取商品列表失败')
          this.listLoading = false
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSearch() {
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { name: '', status: '' }
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增商品'
      this.form = {
        id: null,
        name: '',
        code: '',
        image: '',
        price: 0,
        status: 'up',
        categoryId: '',
        type: '',
        baseInfo: '',
        useLimitYear: 0,
        dynamicFields: {
          parameter: {
            type: 'text',
            data: '',
            images: []
          },
          serviceContent: {
            type: 'text',
            data: '',
            images: []
          },
          precaution: {
            type: 'text',
            data: '',
            images: []
          }
        }
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑商品'

      // 解析JSON数据，处理兼容性问题
      let parameter, serviceContent, precaution

      try {
        parameter = JSON.parse(row.parameter || '{"type":"text","data":"","images":[]}')
        serviceContent = JSON.parse(row.serviceContent || '{"type":"text","data":"","images":[]}')
        precaution = JSON.parse(row.precaution || '{"type":"text","data":"","images":[]}')
      } catch (e) {
        console.warn('解析JSON数据失败，使用默认值:', e)
        parameter = { type: 'text', data: '', images: [] }
        serviceContent = { type: 'text', data: '', images: [] }
        precaution = { type: 'text', data: '', images: [] }
      }

      // 处理旧版本数据结构兼容
      if (parameter && !parameter.images && parameter.data && Array.isArray(parameter.data)) {
        parameter.images = parameter.data
        parameter.data = ''
      }
      if (serviceContent && !serviceContent.images && serviceContent.data && Array.isArray(serviceContent.data)) {
        serviceContent.images = serviceContent.data
        serviceContent.data = ''
      }
      if (precaution && !precaution.images && precaution.data && Array.isArray(precaution.data)) {
        precaution.images = precaution.data
        precaution.data = ''
      }

      this.form = {
        ...row,
        categoryId: row.categoryId || '',
        type: row.type || '',
        baseInfo: row.baseInfo || '',
        useLimitYear: row.useLimitYear || 0,
        image: row.image || '',
        dynamicFields: {
          parameter: {
            type: parameter.type || 'text',
            data: parameter.data || '',
            images: parameter.images || []
          },
          serviceContent: {
            type: serviceContent.type || 'text',
            data: serviceContent.data || '',
            images: serviceContent.images || []
          },
          precaution: {
            type: precaution.type || 'text',
            data: precaution.data || '',
            images: precaution.images || []
          }
        }
      }

      console.log('编辑表单数据:', this.form)
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
        .then(() => {
          // 调用API删除商品
          deleteLeaseGood(row.id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchData()
            })
            .catch(error => {
              console.error('删除商品失败:', error)
              this.$message.error('删除商品失败')
            })
        })
        .catch(() => {})
    },
    handleToggleStatus(row) {
      this.$confirm(`确定要${row.status === 'up' ? '下架' : '上架'}该商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const newStatus = row.status === 'up' ? 'down' : 'up'
        changeGoodStatus(row.id, newStatus).then(response => {
          this.$message({ type: 'success', message: '操作成功!' })
          // 更新本地状态
          row.status = newStatus
          // 刷新表格数据
          this.fetchData()
        }).catch(error => {
          this.$message({ type: 'error', message: '操作失败: ' + (error.message || '未知错误') })
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消操作' })
      })
    },
    // 根据分类ID获取分类名称
    getCategoryName(categoryId) {
      const category = this.categoryOptions.find(item => item.id === categoryId)
      return category ? category.name : ''
    },

    // 图片预览
    handlePictureCardPreview(file) {
      const raw = file.url || (file.response && file.response.data && (file.response.data.url || file.response.data.fileUrl))
      this.previewImage = this.displayUrl(raw)
      this.dialogImageVisible = true
    },

    handleSave() {
      // 表单验证
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.error('请检查表单信息')
          return
        }

        // 处理表单数据
        const formData = { ...this.form }

        // 处理动态字段数据
        formData.parameter = JSON.stringify({
          type: this.form.dynamicFields.parameter.type,
          data: this.form.dynamicFields.parameter.type === 'text'
            ? this.form.dynamicFields.parameter.data
            : this.form.dynamicFields.parameter.images
        })

        formData.serviceContent = JSON.stringify({
          type: this.form.dynamicFields.serviceContent.type,
          data: this.form.dynamicFields.serviceContent.type === 'text'
            ? this.form.dynamicFields.serviceContent.data
            : this.form.dynamicFields.serviceContent.images
        })

        formData.precaution = JSON.stringify({
          type: this.form.dynamicFields.precaution.type,
          data: this.form.dynamicFields.precaution.type === 'text'
            ? this.form.dynamicFields.precaution.data
            : this.form.dynamicFields.precaution.images
        })

        console.log('准备提交的数据:', formData)

        // 确保主图片数据正确
        formData.image = this.form.image || ''

        // 删除不需要提交的字段
        delete formData.dynamicFields

        // 显示加载状态
        const loading = this.$loading({
          lock: true,
          text: this.form.id ? '正在更新商品...' : '正在创建商品...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        if (this.form.id) {
          // 编辑
          updateLeaseGood(formData)
            .then(() => {
              loading.close()
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            })
            .catch(error => {
              loading.close()
              console.error('编辑商品失败:', error)
              this.$message.error('编辑商品失败：' + (error.message || '未知错误'))
            })
        } else {
          // 新增
          addLeaseGood(formData)
            .then(() => {
              loading.close()
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.fetchData()
            })
            .catch(error => {
              loading.close()
              console.error('新增商品失败:', error)
              this.$message.error('新增商品失败：' + (error.message || '未知错误'))
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style>
