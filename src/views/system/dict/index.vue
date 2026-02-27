<template>
  <div class="system-dict-container">
    <el-card class="page-card">
      <div class="filter-container">
        <!-- <el-input
          v-model="typeSearch"
          placeholder="搜索类型名称或编码"
          size="small"
          style="width: 250px; margin-right: 10px;"
          prefix-icon="el-icon-search"
          clearable
        />
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleTypeSearch">
          搜索
        </el-button> -->
        <el-button type="success" icon="el-icon-plus" size="small" style="margin-left: 10px;" @click="handleAddType">
          新增字典类型
        </el-button>
      </div>

      <el-table
        v-loading="typeLoading"
        :data="displayTypeList"
        style="width: 100%; margin-top: 15px;"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="dictName" label="字典名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="dictType" label="字典类型" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="type-code">{{ scope.row.dictType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: #909399;">{{ scope.row.remark || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleViewData(scope.row)">
              查看
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEditType(scope.row)">
              编辑
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" style="color: #F56C6C;" @click="handleDeleteType(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="typeTotal"
          :page-size="typePageSize"
          :page-sizes="[10, 20, 50, 100]"
          v-model:current-page="typePage"
          @size-change="handleTypeSizeChange"
          @current-change="fetchTypeList"
        />
      </div>
    </el-card>

    <!-- 类型新增/编辑弹窗 -->
    <el-dialog
      :title="typeDialogTitle"
      v-model="typeDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="typeForm" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="请输入字典名称，如：性别、状态" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input
            v-model="typeForm.dictType"
            placeholder="请输入字典类型，如：gender、status"
            :disabled="!!typeForm.id"
          >
            <template #append>
              <el-tooltip content="字典类型创建后不可修改" placement="top">
                <i class="el-icon-info"></i>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="typeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="typeDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="typeSaving" @click="handleSaveType">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDictTypeList,
  createDictType,
  updateDictType,
  deleteDictType
} from '@/api/dict'
import { parseTime } from '@/utils'

export default {
  name: 'SystemDictType',
  data() {
    return {
      // 类型相关
      typeList: [],
      displayTypeList: [],
      typeSearch: '',
      typeLoading: false,
      typeDialogVisible: false,
      typeDialogTitle: '',
      typeSaving: false,
      typeForm: {
        id: null,
        dictName: '',
        dictType: '',
        status: 1,
        remark: ''
      },
      typeRules: {
        dictName: [
          { required: true, message: '请输入字典名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        dictType: [
          { required: true, message: '请输入字典类型', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '只能包含字母、数字和下划线，且必须以字母开头', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      typeTotal: 0,
      typePage: 1,
      typePageSize: 10
    }
  },
  created() {
    this.fetchTypeList()
  },
  methods: {
    // ==================== 字典类型相关 ====================
    async fetchTypeList() {
      this.typeLoading = true
      try {
        const res = await getDictTypeList()
        if (res.code === 200 || res.code === 0) {
          this.typeList = res.data || []
          this.handleTypeSearch()
          this.typeTotal = this.displayTypeList.length
        }
      } catch (error) {
        console.error('获取字典类型列表失败:', error)
        this.$message.error('获取字典类型列表失败')
      } finally {
        this.typeLoading = false
      }
    },

    handleTypeSearch() {
      if (!this.typeSearch) {
        this.displayTypeList = [...this.typeList]
      } else {
        const keyword = this.typeSearch.toLowerCase()
        this.displayTypeList = this.typeList.filter(t =>
          t.dictName.toLowerCase().includes(keyword) ||
          t.dictType.toLowerCase().includes(keyword)
        )
      }
      this.typeTotal = this.displayTypeList.length
    },

    handleTypeSizeChange(size) {
      this.typePageSize = size
      this.typePage = 1
    },

    handleAddType() {
      this.typeDialogTitle = '新增字典类型'
      this.typeForm = {
        id: null,
        dictName: '',
        dictType: '',
        status: 1,
        remark: ''
      }
      this.typeDialogVisible = true
      this.$nextTick(() => {
        this.$refs.typeForm && this.$refs.typeForm.clearValidate()
      })
    },

    handleEditType(row) {
      this.typeDialogTitle = '编辑字典类型'
      this.typeForm = { ...row }
      this.typeDialogVisible = true
      this.$nextTick(() => {
        this.$refs.typeForm && this.$refs.typeForm.clearValidate()
      })
    },

    handleDeleteType(row) {
      this.$confirm(`确定要删除字典类型"${row.dictName}"吗？`, '警告', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }).then(async() => {
        try {
          const res = await deleteDictType(row.id)
          if (res.code === 200 || res.code === 0) {
            this.$message.success('删除成功')
            this.fetchTypeList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除字典类型失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    handleSaveType() {
      this.$refs.typeForm.validate(async(valid) => {
        if (!valid) return

        this.typeSaving = true
        try {
          const isEdit = !!this.typeForm.id
          const api = isEdit ? updateDictType : createDictType
          const res = await api(this.typeForm)

          if (res.code === 200 || res.code === 0) {
            this.$message.success(isEdit ? '更新成功' : '创建成功')
            this.typeDialogVisible = false
            this.fetchTypeList()
          } else {
            this.$message.error(res.message || (isEdit ? '更新失败' : '创建失败'))
          }
        } catch (error) {
          console.error('保存字典类型失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.typeSaving = false
        }
      })
    },

    handleViewData(row) {
      // 跳转到字典数据页面
      this.$router.push({
        name: 'SystemDictData',
        query: {
          dictType: row.dictType,
          dictName: row.dictName
        }
      })
    },

    // ==================== 工具方法 ====================
    formatDateTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '--'
    }
  }
}
</script>

<style lang="scss" scoped>
.system-dict-container {
  padding: 10px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);

  .page-card {
    border-radius: 1px;

    .card-header {
      display: flex;
      flex-direction: column;

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;

        i {
          margin-right: 8px;
          color: #409EFF;
        }
      }

      .card-subtitle {
        font-size: 13px;
        color: #909399;
        margin-top: 5px;
      }
    }
  }

  .filter-container {
    margin-bottom: 0;
  }

  .type-code {
    font-size: 13px;
    color: #606266;
    font-family: 'Courier New', monospace;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
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
