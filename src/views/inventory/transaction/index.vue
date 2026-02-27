<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="仓库">
        <el-input
          v-model="searchForm.warehouseName"
          placeholder="请选择仓库"
          readonly
          style="width: 180px;"
          @focus="showWarehouseSelector"
        >
          <template #suffix>
            <i class="el-icon-search el-input__icon" style="cursor: pointer;" @click="showWarehouseSelector" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="货物编号">
        <el-input v-model="searchForm.goodNo" placeholder="请输入货物编号" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="货物名称">
        <el-input v-model="searchForm.goodName" placeholder="请输入货物名称" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item label="交易类型">
        <el-select v-model="searchForm.transactionType" placeholder="请选择交易类型" clearable style="width: 120px;">
          <el-option
            v-for="item in transactionTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型">
        <el-input v-model="searchForm.businessType" placeholder="请输入业务类型" clearable style="width: 120px;" />
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 300px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template #default="props">
          <el-form label-position="left" class="table-expand">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="流水号:">
                  <span>{{ props.row.transactionNo }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="变动前库存:">
                  <span>{{ props.row.beforeStock }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="变动后库存:">
                  <span>{{ props.row.afterStock }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="关联单号:">
                  <span>{{ props.row.relatedNo || '-' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="操作人:">
                  <span>{{ props.row.operatorName || '-' }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="transactionNo" label="流水号" width="180" show-overflow-tooltip />
      <el-table-column prop="warehouseName" label="仓库" width="120" />
      <el-table-column prop="goodNo" label="货物编号" width="120" />
      <el-table-column prop="goodName" label="货物名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="transactionType" label="交易类型" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getTransactionTypeTag(scope.row.transactionType)" size="small">
            {{ getTransactionTypeText(scope.row.transactionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="businessType" label="业务类型" width="100" align="center">
        <template #default="scope">
          <el-tag size="small">{{ getBusinessTypeText(scope.row.businessType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="变动数量" width="100" align="center">
        <template #default="scope">
          <span :style="{ color: getQuantityColor(scope.row.quantity) }">
            {{ formatQuantity(scope.row.quantity) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="beforeStock" label="变动前库存" width="110" align="center" />
      <el-table-column prop="afterStock" label="变动后库存" width="110" align="center" />
      <el-table-column prop="operatorName" label="操作人" width="100" />
      <el-table-column prop="transactionTime" label="交易时间" width="180" />
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

    <!-- 仓库选择器 -->
    <WarehouseSelector
      v-model:visible="warehouseSelectorVisible"
      title="选择仓库"
      :multiple="false"
      :active-only="false"
      @confirm="handleWarehouseSelected"
    />
  </div>
</template>

<script>
import { getTransactionPage } from '@/api/inventory'
import {
  TRANSACTION_TYPE_OPTIONS,
  TRANSACTION_TYPE_MAP,
  BUSINESS_TYPE_MAP
} from '@/constants/inventory'
import WarehouseSelector from '@/components/WarehouseSelector'

export default {
  name: 'TransactionLog',
  components: {
    WarehouseSelector
  },
  data() {
    return {
      loading: false,
      warehouseSelectorVisible: false,
      transactionTypeOptions: TRANSACTION_TYPE_OPTIONS,
      dateRange: [],

      // 搜索表单
      searchForm: {
        warehouseId: '',
        warehouseName: '',
        goodNo: '',
        goodName: '',
        transactionType: '',
        businessType: '',
        startTime: '',
        endTime: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    // 获取列表数据
    async fetchList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.page,
          pageSize: this.pagination.size
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startTime = this.dateRange[0]
          params.endTime = this.dateRange[1]
        }
        const response = await getTransactionPage(params)
        if (response && response.data) {
          this.tableData = response.data.records || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取库存流水失败:', error)
        this.$message.error('获取库存流水失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        warehouseId: '',
        warehouseName: '',
        goodNo: '',
        goodName: '',
        transactionType: '',
        businessType: '',
        startTime: '',
        endTime: ''
      }
      this.dateRange = []
      this.pagination.page = 1
      this.fetchList()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchList()
    },

    // 页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchList()
    },

    // 显示仓库选择器
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 仓库选择
    handleWarehouseSelected(warehouses) {
      if (warehouses && warehouses.length > 0) {
        this.searchForm.warehouseId = warehouses[0].id
        this.searchForm.warehouseName = warehouses[0].warehouseName
      }
    },

    // 导出
    handleExport() {
      this.$message.info('导出功能开发中...')
      // TODO: 实现导出功能
    },

    // 获取交易类型文本
    getTransactionTypeText(type) {
      return TRANSACTION_TYPE_MAP[type] || type
    },

    // 获取交易类型标签
    getTransactionTypeTag(type) {
      const tagMap = {
        in: 'success',
        out: 'danger',
        lock: 'warning',
        unlock: 'info',
        adjust: ''
      }
      return tagMap[type] || ''
    },

    // 获取业务类型文本
    getBusinessTypeText(type) {
      return BUSINESS_TYPE_MAP[type] || type
    },

    // 格式化数量显示
    formatQuantity(quantity) {
      if (quantity > 0) {
        return '+' + quantity
      } else if (quantity < 0) {
        return quantity
      }
      return quantity
    },

    // 获取数量颜色
    getQuantityColor(quantity) {
      if (quantity > 0) {
        return '#67c23a' // 绿色 - 正数（入库）
      } else if (quantity < 0) {
        return '#f56c6c' // 红色 - 负数（出库）
      }
      return '#303133'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }

  .table-expand {
    font-size: 0;
    padding: 20px;
    background-color: #f8f9fa;

    .el-form-item {
      margin-right: 0;
      margin-bottom: 10px;
      width: 100%;

      label {
        width: 140px;
        color: #606266;
        font-weight: 500;
      }

      span {
        color: #303133;
      }
    }
  }
}
</style>
