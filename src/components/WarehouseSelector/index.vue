<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    class="warehouse-selector-dialog"
  >
    <div class="warehouse-selector">
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="仓库名称">
          <el-input
            v-model="searchParams.warehouseName"
            placeholder="请输入仓库名称"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="仓库编号">
          <el-input
            v-model="searchParams.warehouseNo"
            placeholder="请输入仓库编号"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <!-- <el-form-item v-if="!activeOnly" label="状态">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 仓库列表 -->
      <el-table
        v-loading="loading"
        :data="warehouseList"
        border
        highlight-current-row
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <!-- 多选列 -->
        <el-table-column
          v-if="multiple"
          type="selection"
          width="55"
        />

        <el-table-column prop="warehouseNo" label="仓库编号" width="150" />
        <el-table-column prop="warehouseName" label="仓库名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="warehouseAddress" label="仓库地址" min-width="200" show-overflow-tooltip />
        <!-- <el-table-column prop="warehouseType" label="仓库类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getWarehouseTypeTag(scope.row.warehouseType)" size="mini">
              {{ getWarehouseTypeText(scope.row.warehouseType) }}
            </el-tag>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="managerName" label="负责人" width="100" /> -->
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="showPagination"
        :current-page="pagination.page"
        :page-sizes="[5, 10, 20]"
        :page-size="pagination.size"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; text-align: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <!-- 已选择仓库展示 -->
      <div v-if="multiple && selectedWarehouses.length > 0" class="selected-warehouses">
        <div class="selected-title">
          <span>已选择仓库 ({{ selectedWarehouses.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="warehouse in selectedWarehouses"
            :key="warehouse.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeWarehouse(warehouse)"
          >
            {{ warehouse.warehouseNo }} - {{ warehouse.warehouseName }}
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!canConfirm" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getWarehousePage, listActiveWarehouses } from '@/api/inventory'
import { WAREHOUSE_TYPE_MAP } from '@/constants/inventory'

export default {
  name: 'WarehouseSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择仓库'
    },
    width: {
      type: String,
      default: '900px'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    activeOnly: {
      type: Boolean,
      default: false
    },
    defaultSelected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      warehouseList: [],
      selectedWarehouses: [],
      searchParams: {
        warehouseName: '',
        warehouseNo: '',
        status: this.activeOnly ? 'active' : ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    canConfirm() {
      return this.selectedWarehouses.length > 0
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedWarehouses.length})`
      }
      return '确定选择'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData()
      }
    },
    defaultSelected: {
      handler(val) {
        this.selectedWarehouses = [...val]
      },
      immediate: true
    }
  },
  methods: {
    async initData() {
      this.searchParams = {
        warehouseName: '',
        warehouseNo: '',
        status: this.activeOnly ? 'active' : ''
      }
      this.pagination.page = 1
      await this.fetchWarehouseList()
    },
    async fetchWarehouseList() {
      this.loading = true
      try {
        if (this.activeOnly) {
          const response = await listActiveWarehouses()
          if (response && response.data) {
            this.warehouseList = response.data || []
            this.pagination.total = this.warehouseList.length
          }
        } else {
          const params = {
            ...this.searchParams,
            pageNum: this.pagination.page,
            pageSize: this.pagination.size
          }
          const response = await getWarehousePage(params)
          if (response && response.data) {
            this.warehouseList = response.data.records || []
            this.pagination.total = response.data.total || 0
          }
        }
      } catch (error) {
        console.error('获取仓库列表失败:', error)
        this.$message.error('获取仓库列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchWarehouseList()
    },
    handleReset() {
      this.searchParams = {
        warehouseName: '',
        warehouseNo: '',
        status: this.activeOnly ? 'active' : ''
      }
      this.pagination.page = 1
      this.fetchWarehouseList()
    },
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchWarehouseList()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchWarehouseList()
    },
    handleSelectionChange(selection) {
      this.selectedWarehouses = selection
    },
    handleRowClick(row) {
      if (!this.multiple) {
        this.selectedWarehouses = [row]
      }
    },
    getRowClassName({ row }) {
      if (this.selectedWarehouses.some(w => w.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },
    removeWarehouse(warehouse) {
      const index = this.selectedWarehouses.findIndex(w => w.id === warehouse.id)
      if (index > -1) {
        this.selectedWarehouses.splice(index, 1)
      }
    },
    clearSelection() {
      this.selectedWarehouses = []
    },
    getWarehouseTypeText(type) {
      return WAREHOUSE_TYPE_MAP[type] || type
    },
    getWarehouseTypeTag(type) {
      const tagMap = {
        raw_material: 'warning',
        finished_product: 'success',
        transfer: 'info'
      }
      return tagMap[type] || ''
    },
    handleConfirm() {
      if (this.selectedWarehouses.length === 0) {
        this.$message.warning('请至少选择一个仓库')
        return
      }
      this.$emit('confirm', this.selectedWarehouses)
      this.handleClose()
    },
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.warehouse-selector-dialog {
  .warehouse-selector {
    .selected-warehouses {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;

      .selected-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: 500;
        color: #606266;
      }

      .selected-tags {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
}

:deep(.selected-row) {
  background-color: #e6f7ff !important;

  td {
    background-color: #e6f7ff !important;
  }

  &:hover td {
    background-color: #bae7ff !important;
  }
}
</style>
