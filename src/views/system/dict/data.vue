<template>
  <div class="system-dict-data-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button
              type="text"
              icon="el-icon-arrow-left"
              size="medium"
              @click="goBack"
            >
              返回
            </el-button>
            <span class="card-title">
              <i class="el-icon-document"></i>
              字典数据管理
              <el-tag size="medium" type="primary" style="margin-left: 10px;">
                {{ dictName }}
              </el-tag>
            </span>
          </div>
          <span class="card-subtitle">{{ dictType }}</span>
        </div>
      </template>

      <div class="filter-container">
        <el-input
          v-model="itemSearch"
          placeholder="搜索字典标签或键值"
          size="small"
          style="width: 250px; margin-right: 10px;"
          prefix-icon="el-icon-search"
          clearable
        />
        <el-button type="primary" icon="el-icon-search" size="small" @click="fetchItemList">
          搜索
        </el-button>
        <el-button
          type="success"
          icon="el-icon-plus"
          size="small"
          style="margin-left: 10px;"
          @click="handleAddItem"
        >
          新增字典数据
        </el-button>
      </div>

      <el-table
        v-loading="itemLoading"
        :data="itemList"
        style="width: 100%; margin-top: 15px;"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="dictLabel" label="字典标签" min-width="150" show-overflow-tooltip />
        <el-table-column prop="dictValue" label="字典键值" min-width="150" show-overflow-tooltip />
        <el-table-column prop="dictSort" label="排序" width="100" align="center">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.dictSort }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isDefault" label="默认" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isDefault === '1'" type="warning" size="small">是</el-tag>
            <span v-else style="color: #909399;">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: #909399;">{{ scope.row.remark || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEditItem(scope.row)">
              编辑
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" style="color: #F56C6C;" @click="handleDeleteItem(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="itemTotal"
          :page-size="itemPageSize"
          :page-sizes="[10, 20, 50, 100]"
          v-model:current-page="itemPage"
          @size-change="handleItemSizeChange"
          @current-change="fetchItemList"
        />
      </div>
    </el-card>

    <!-- 字典项新增/编辑弹窗 -->
    <el-dialog
      :title="itemDialogTitle"
      v-model="itemDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="itemForm" :model="itemForm" :rules="itemRules" label-width="100px">
        <el-form-item label="所属类型">
          <el-tag type="primary">{{ dictName }}</el-tag>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="itemForm.dictLabel" placeholder="请输入字典标签，如：男、女" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="itemForm.dictValue" placeholder="请输入字典键值，如：1、0" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number
            v-model="itemForm.dictSort"
            :min="0"
            :max="9999"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">数值越小越靠前</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="itemForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="itemForm.isDefault">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="itemForm.cssClass" placeholder="CSS样式类名" />
          <div class="form-tip">用于前端样式扩展</div>
        </el-form-item> -->
        <!-- <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="itemForm.listClass" placeholder="请选择" style="width: 100%;" clearable>
            <el-option label="默认" value="default" />
            <el-option label="主要" value="primary" />
            <el-option label="成功" value="success" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
          </el-select>
          <div class="form-tip">表格回显的样式类型</div>
        </el-form-item> -->
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="itemForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="itemDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="itemSaving" @click="handleSaveItem">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDictItemPage,
  createDictItem,
  updateDictItem,
  deleteDictItem
} from '@/api/dict'
import { parseTime } from '@/utils'

export default {
  name: 'SystemDictData',
  data() {
    return {
      dictType: '',
      dictName: '',

      // 字典项相关
      itemList: [],
      itemSearch: '',
      itemLoading: false,
      itemDialogVisible: false,
      itemDialogTitle: '',
      itemSaving: false,
      itemForm: {
        id: null,
        dictSort: 0,
        dictLabel: '',
        dictValue: '',
        dictType: '',
        cssClass: '',
        listClass: '',
        isDefault: '0',
        status: 1,
        remark: ''
      },
      itemRules: {
        dictLabel: [
          { required: true, message: '请输入字典标签', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '请输入字典键值', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '请输入排序值', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        isDefault: [
          { required: true, message: '请选择是否默认', trigger: 'change' }
        ]
      },
      itemTotal: 0,
      itemPage: 1,
      itemPageSize: 10
    }
  },
  created() {
    // 从路由参数中获取字典类型
    const { dictType, dictName } = this.$route.query
    if (!dictType) {
      this.$message.error('缺少字典类型参数')
      this.$router.back()
      return
    }

    this.dictType = dictType
    this.dictName = dictName || dictType
    this.fetchItemList()
  },
  methods: {
    // ==================== 字典项相关 ====================
    async fetchItemList() {
      this.itemLoading = true
      try {
        const params = {
          dictType: this.dictType,
          dictLabel: this.itemSearch || undefined,
          page: this.itemPage,
          pageSize: this.itemPageSize
        }

        const res = await getDictItemPage(params)
        if (res.code === 200 || res.code === 0) {
          this.itemList = res.data.records || res.data.list || []
          this.itemTotal = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取字典数据列表失败')
        }
      } catch (error) {
        console.error('获取字典数据列表失败:', error)
        this.$message.error('获取字典数据列表失败')
      } finally {
        this.itemLoading = false
      }
    },

    handleItemSizeChange(size) {
      this.itemPageSize = size
      this.itemPage = 1
      this.fetchItemList()
    },

    handleAddItem() {
      this.itemDialogTitle = '新增字典数据'
      this.itemForm = {
        id: null,
        dictSort: 0,
        dictLabel: '',
        dictValue: '',
        dictType: this.dictType,
        cssClass: '',
        listClass: '',
        isDefault: '0',
        status: 1,
        remark: ''
      }
      this.itemDialogVisible = true
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate()
      })
    },

    handleEditItem(row) {
      this.itemDialogTitle = '编辑字典数据'
      this.itemForm = { ...row }
      this.itemDialogVisible = true
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate()
      })
    },

    handleDeleteItem(row) {
      this.$confirm(`确定要删除字典数据"${row.dictLabel}"吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async() => {
        try {
          const res = await deleteDictItem(row.id)
          if (res.code === 200 || res.code === 0) {
            this.$message.success('删除成功')
            this.fetchItemList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除字典数据失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    handleSaveItem() {
      this.$refs.itemForm.validate(async(valid) => {
        if (!valid) return

        this.itemSaving = true
        try {
          const isEdit = !!this.itemForm.id
          const api = isEdit ? updateDictItem : createDictItem
          const data = {
            ...this.itemForm,
            dictType: this.dictType
          }
          const res = await api(data)

          if (res.code === 200 || res.code === 0) {
            this.$message.success(isEdit ? '更新成功' : '创建成功')
            this.itemDialogVisible = false
            this.fetchItemList()
          } else {
            this.$message.error(res.message || (isEdit ? '更新失败' : '创建失败'))
          }
        } catch (error) {
          console.error('保存字典数据失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.itemSaving = false
        }
      })
    },

    goBack() {
      this.$router.back()
    },

    // ==================== 工具方法 ====================
    formatDateTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '--'
    }
  }
}
</script>

<style lang="scss" scoped>
.system-dict-data-container {
  padding: 10px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);

  .page-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      flex-direction: column;

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          display: flex;
          align-items: center;

          i {
            margin-right: 8px;
            color: #409EFF;
          }
        }
      }

      .card-subtitle {
        font-size: 13px;
        color: #909399;
        margin-top: 5px;
        margin-left: 90px;
        font-family: 'Courier New', monospace;
      }
    }
  }

  .filter-container {
    margin-bottom: 0;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.5;
  }

  ::v-deep .el-table {
    font-size: 13px;
  }

  ::v-deep .el-dialog__header {
    background: #f5f7fa;
    padding: 15px 20px;
    border-bottom: 1px solid #e4e7ed;
  }

  ::v-deep .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
  }

  ::v-deep .el-form-item__label {
    font-weight: 500;
  }
}
</style>
