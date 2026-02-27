<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    class="good-selector-dialog"
  >
    <div class="good-selector">
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="货物编号">
          <el-input
            v-model="searchParams.goodNo"
            placeholder="请输入货物编号"
            clearable
            style="width: 180px;"
          />
        </el-form-item>
        <el-form-item label="货物名称">
          <el-input
            v-model="searchParams.goodName"
            placeholder="请输入货物名称"
            clearable
            style="width: 180px;"
          />
        </el-form-item>
        <el-form-item label="货物类型">
          <el-input
            v-model="searchParams.goodType"
            placeholder="请输入货物类型"
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 货物列表 -->
      <el-table
        v-loading="loading"
        :data="goodList"
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

        <el-table-column prop="goodNo" label="货物编号" width="150" />
        <el-table-column prop="goodName" label="货物名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="goodType" label="货物类型" width="120" />
        <el-table-column prop="goodModel" label="型号" width="120" show-overflow-tooltip />
        <!-- <el-table-column prop="unit" label="单位" width="80" align="center" /> -->
        <el-table-column v-if="showStock" prop="currentStock" label="可用库存" width="100" align="center">
          <template #default="scope">
            {{ scope.row.currentStock }}
          </template>
        </el-table-column>
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

      <!-- 已选择货物展示 -->
      <div v-if="multiple && selectedGoods.length > 0" class="selected-goods">
        <div class="selected-title">
          <span>已选择货物 ({{ selectedGoods.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="good in selectedGoods"
            :key="good.goodNo || good.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeGood(good)"
          >
            {{ good.goodNo }} - {{ good.goodName }}
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
import { getInventoryPage } from '@/api/inventory'

export default {
  name: 'GoodSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择货物'
    },
    width: {
      type: String,
      default: '1000px'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    showStock: {
      type: Boolean,
      default: true
    },
    warehouseId: {
      type: String,
      default: ''
    },
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 是否使用外部提供的货物列表（用于基于订单明细的选择）
    useExternal: {
      type: Boolean,
      default: false
    },
    // 外部提供的货物列表
    externalList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      goodList: [],
      selectedGoods: [],
      searchParams: {
        goodNo: '',
        goodName: '',
        goodType: ''
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
      return this.selectedGoods.length > 0
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedGoods.length})`
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
        this.selectedGoods = [...val]
      },
      immediate: true
    }
  },
  methods: {
    async initData() {
      this.searchParams = {
        goodNo: '',
        goodName: '',
        goodType: ''
      }
      this.pagination.page = 1
      if (this.useExternal) {
        // 外部列表模式下，直接使用外部数据并关闭分页
        this.goodList = Array.isArray(this.externalList) ? [...this.externalList] : []
      } else {
        await this.fetchGoodList()
      }
    },
    async fetchGoodList() {
      if (this.useExternal) return
      this.loading = true
      try {
        const data = {
          ...this.searchParams,
          pageNum: this.pagination.page,
          pageSize: this.pagination.size
        }
        if (this.warehouseId) {
          data.warehouseId = this.warehouseId
        }
        const response = await getInventoryPage(data)
        if (response && response.data) {
          this.goodList = response.data.records || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取货物列表失败:', error)
        this.$message.error('获取货物列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      if (this.useExternal) return
      this.pagination.page = 1
      this.fetchGoodList()
    },
    handleReset() {
      if (this.useExternal) return
      this.searchParams = {
        goodNo: '',
        goodName: '',
        goodType: ''
      }
      this.pagination.page = 1
      this.fetchGoodList()
    },
    handleSizeChange(size) {
      if (this.useExternal) return
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchGoodList()
    },
    handleCurrentChange(page) {
      if (this.useExternal) return
      this.pagination.page = page
      this.fetchGoodList()
    },
    handleSelectionChange(selection) {
      this.selectedGoods = selection
    },
    handleRowClick(row) {
      if (!this.multiple) {
        this.selectedGoods = [row]
      }
    },
    getRowClassName({ row }) {
      const key = row.goodNo || row.id
      if (this.selectedGoods.some(g => (g.goodNo || g.id) === key)) {
        return 'selected-row'
      }
      return ''
    },
    removeGood(good) {
      const key = good.goodNo || good.id
      const index = this.selectedGoods.findIndex(g => (g.goodNo || g.id) === key)
      if (index > -1) {
        this.selectedGoods.splice(index, 1)
      }
    },
    clearSelection() {
      this.selectedGoods = []
    },
    getStockTagType(quantity) {
      if (quantity <= 0) return 'danger'
      if (quantity < 10) return 'warning'
      return 'success'
    },
    handleConfirm() {
      if (this.selectedGoods.length === 0) {
        this.$message.warning('请至少选择一个货物')
        return
      }
      this.$emit('confirm', this.selectedGoods)
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
.good-selector-dialog {
  .good-selector {
    .selected-goods {
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
