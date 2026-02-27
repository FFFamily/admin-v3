<template>
  <div class="app-container">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="仓库">
          <el-input
            v-model="filterForm.warehouseName"
            placeholder="请选择仓库"
            readonly
            style="width: 200px;"
            @focus="showWarehouseSelector"
          >
            <template #suffix>
              <i class="el-icon-search el-input__icon" style="cursor: pointer;" @click="showWarehouseSelector" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="loadStatistics">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff;">
              <i class="el-icon-box" />
            </div>
            <div class="stat-info">
              <div class="stat-label">仓库总数</div>
              <div class="stat-value">{{ statistics.warehouseCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a;">
              <i class="el-icon-goods" />
            </div>
            <div class="stat-info">
              <div class="stat-label">货物种类</div>
              <div class="stat-value">{{ statistics.goodTypeCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <i class="el-icon-warning" />
            </div>
            <div class="stat-info">
              <div class="stat-label">库存预警</div>
              <div class="stat-value">{{ statistics.warningCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <i class="el-icon-lock" />
            </div>
            <div class="stat-info">
              <div class="stat-label">锁定库存</div>
              <div class="stat-value">{{ statistics.totalLockedQuantity || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 仓库库存分布 -->
    <el-card class="chart-card" shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="clearfix">
          <span class="card-title">仓库库存分布</span>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="warehouseInventory"
        border
        style="width: 100%"
      >
        <el-table-column prop="warehouseName" label="仓库名称" min-width="150" />
        <el-table-column prop="warehouseType" label="仓库类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getWarehouseTypeTag(scope.row.warehouseType)" size="small">
              {{ getWarehouseTypeText(scope.row.warehouseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goodTypeCount" label="货物种类" width="120" align="center" />
        <el-table-column prop="totalQuantity" label="总库存" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.totalQuantity || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="availableQuantity" label="可用库存" width="120" align="center">
          <template #default="scope">
            <el-tag type="success" size="small">{{ scope.row.availableQuantity || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lockedQuantity" label="锁定库存" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.lockedQuantity > 0" type="warning" size="small">
              {{ scope.row.lockedQuantity }}
            </el-tag>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column prop="warningCount" label="预警数量" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.warningCount > 0" type="danger" size="small">
              {{ scope.row.warningCount }}
            </el-tag>
            <span v-else>0</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 低库存预警列表 -->
    <el-card class="chart-card" shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="clearfix">
          <span class="card-title">低库存预警列表</span>
          <el-badge :value="warningList.length" :max="99" class="badge-item" style="float: right;">
            <el-button size="small" type="warning" @click="refreshWarnings">刷新预警</el-button>
          </el-badge>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="warningList"
        border
        style="width: 100%"
        max-height="400"
      >
        <el-table-column prop="warehouseName" label="仓库" width="150" />
        <el-table-column prop="goodNo" label="货物编号" width="150" />
        <el-table-column prop="goodName" label="货物名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="goodType" label="货物类型" width="120" />
        <el-table-column prop="totalQuantity" label="当前库存" width="100" align="center">
          <template #default="scope">
            <el-tag type="danger" size="small">{{ scope.row.totalQuantity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="安全库存" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="goToInventoryDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 仓库选择器 -->
    <WarehouseSelector
      v-model:visible="warehouseSelectorVisible"
      title="选择仓库"
      :multiple="false"
      :active-only="true"
      @confirm="handleWarehouseSelected"
    />
  </div>
</template>

<script>
import { getInventoryStatistics, getInventoryWarning } from '@/api/inventory'
import { WAREHOUSE_TYPE_MAP } from '@/constants/inventory'
import WarehouseSelector from '@/components/WarehouseSelector'

export default {
  name: 'InventoryStatistics',
  components: {
    WarehouseSelector
  },
  data() {
    return {
      loading: false,
      warehouseSelectorVisible: false,

      // 筛选表单
      filterForm: {
        warehouseId: '',
        warehouseName: ''
      },

      // 统计数据
      statistics: {
        warehouseCount: 0,
        goodTypeCount: 0,
        warningCount: 0,
        totalLockedQuantity: 0
      },

      // 仓库库存列表
      warehouseInventory: [],

      // 预警列表
      warningList: []
    }
  },
  mounted() {
    this.loadStatistics()
    this.loadWarnings()
  },
  methods: {
    // 加载统计数据
    async loadStatistics() {
      this.loading = true
      try {
        const params = {}
        if (this.filterForm.warehouseId) {
          params.warehouseId = this.filterForm.warehouseId
        }
        const response = await getInventoryStatistics(params)
        if (response && response.data) {
          const data = response.data
          this.statistics = {
            warehouseCount: data.warehouseCount || 0,
            goodTypeCount: data.goodTypeCount || 0,
            warningCount: data.warningCount || 0,
            totalLockedQuantity: data.totalLockedQuantity || 0
          }
          this.warehouseInventory = data.warehouseInventory || []
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败')
      } finally {
        this.loading = false
      }
    },

    // 加载预警列表
    async loadWarnings() {
      try {
        const params = {}
        if (this.filterForm.warehouseId) {
          params.warehouseId = this.filterForm.warehouseId
        }
        const response = await getInventoryWarning(params)
        if (response && response.data) {
          this.warningList = response.data || []
        }
      } catch (error) {
        console.error('获取预警列表失败:', error)
      }
    },

    // 刷新预警
    async refreshWarnings() {
      await this.loadWarnings()
      this.$message.success('预警列表已刷新')
    },

    // 重置筛选
    handleReset() {
      this.filterForm = {
        warehouseId: '',
        warehouseName: ''
      }
      this.loadStatistics()
      this.loadWarnings()
    },

    // 显示仓库选择器
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 仓库选择
    handleWarehouseSelected(warehouses) {
      if (warehouses && warehouses.length > 0) {
        this.filterForm.warehouseId = warehouses[0].id
        this.filterForm.warehouseName = warehouses[0].warehouseName
      }
    },

    // 获取仓库类型文本
    getWarehouseTypeText(type) {
      return WAREHOUSE_TYPE_MAP[type] || type
    },

    // 获取仓库类型标签
    getWarehouseTypeTag(type) {
      const tagMap = {
        raw_material: 'warning',
        finished_product: 'success',
        transfer: 'info'
      }
      return tagMap[type] || ''
    },

    // 跳转到库存详情
    goToInventoryDetail(row) {
      this.$router.push({
        path: '/inventory/list',
        query: {
          warehouseId: row.warehouseId,
          goodNo: row.goodNo
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .filter-card {
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: white;
        margin-right: 20px;
      }

      .stat-info {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }

  .chart-card {
    .card-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }

    .badge-item {
      margin-left: 10px;
    }
  }
}
</style>
