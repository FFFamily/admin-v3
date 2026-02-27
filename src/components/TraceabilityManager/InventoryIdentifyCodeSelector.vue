<template>
  <div class="inventory-selector">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="识别码">
        <el-input v-model="searchForm.identifyCode" placeholder="请输入识别码" />
      </el-form-item>
      <el-form-item label="货物名称">
        <el-input v-model="searchForm.goodName" placeholder="请输入货物名称" />
      </el-form-item>
      <el-form-item label="流转步骤">
        <el-select v-model="searchForm.flowStep" placeholder="请选择流转步骤">
          <el-option
            v-for="option in flowStepOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 库存列表 -->
    <el-table
      v-loading="loading"
      :data="inventoryList"
      border
      :show-summary="true"
      :summary-method="getSummaryMethod"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="identifyCode" label="识别码" width="180" align="center">
        <template #default="scope">
          <el-tag type="primary">{{ scope.row.identifyCode }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="flowStep" label="流转步骤" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getFlowStepTagType(scope.row.flowStep)" size="small">
            {{ getFlowStepText(scope.row.flowStep) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="goodNo" label="货物编号" width="120" align="center" />
      <el-table-column prop="goodName" label="货物名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="goodModel" label="规格型号" width="120" align="center" />
      <el-table-column prop="goodCount" label="库存数量" width="100" align="center">
        <template #default="scope">
          <span :class="{ 'low-stock': scope.row.goodCount < 10 }">
            {{ scope.row.goodCount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="goodWeight" label="库存重量" width="100" align="center" />
      <el-table-column prop="goodStatus" label="货物状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getGoodsStatusTagType(scope.row.goodStatus)" size="small">
            {{ getGoodsStatusText(scope.row.goodStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="存放位置" width="120" align="center" />
      <el-table-column prop="updateTime" label="更新时间" width="150" align="center">
        <template #default="scope">
          {{ formatDateTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            @click="viewTraceability(scope.row)"
          >
            查看追溯
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 底部操作按钮 -->
    <div class="footer-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :disabled="selectedItems.length === 0"
        @click="handleConfirm"
      >
        确定选择 ({{ selectedItems.length }})
      </el-button>
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import {
  FLOW_STEP_OPTIONS,
  getFlowStepText,
  getGoodsStatusText
} from '@/constants/traceability'

export default {
  name: 'InventoryIdentifyCodeSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchForm: {
        identifyCode: '',
        goodName: '',
        flowStep: ''
      },
      inventoryList: [],
      selectedItems: [],
      loading: false,
      pagination: {
        page: 1,
        size: 20,
        total: 0
      },
      flowStepOptions: FLOW_STEP_OPTIONS
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadInventoryData()
      }
    }
  },
  methods: {
    // 加载库存数据
    async loadInventoryData() {
      this.loading = true
      try {
        // 模拟API调用
        const response = await this.mockInventoryAPI()
        this.inventoryList = response.data.records || []
        this.pagination.total = response.data.total || 0
      } catch (error) {
        this.$message.error('加载库存数据失败')
        console.error('库存数据加载失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 模拟库存API
    async mockInventoryAPI() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              records: [
                {
                  identifyCode: 'STO20241010ABC001',
                  flowStep: 'storage',
                  goodNo: 'G001',
                  goodName: 'PVC透明片',
                  goodModel: 'T-001',
                  goodCount: 500,
                  goodWeight: '250kg',
                  goodStatus: 'in_stock',
                  location: '仓库A-01',
                  updateTime: '2024-10-10 15:30:00'
                },
                {
                  identifyCode: 'STO20241010ABC002',
                  flowStep: 'storage',
                  goodNo: 'G002',
                  goodName: 'PVC绿色片',
                  goodModel: 'G-001',
                  goodCount: 200,
                  goodWeight: '100kg',
                  goodStatus: 'in_stock',
                  location: '仓库A-02',
                  updateTime: '2024-10-10 16:00:00'
                },
                {
                  identifyCode: 'PRO20241009DEF001',
                  flowStep: 'process',
                  goodNo: 'G003',
                  goodName: 'PVC混合料',
                  goodModel: 'M-001',
                  goodCount: 800,
                  goodWeight: '400kg',
                  goodStatus: 'processing',
                  location: '加工车间B',
                  updateTime: '2024-10-09 14:20:00'
                }
              ],
              total: 3
            }
          })
        }, 800)
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadInventoryData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        identifyCode: '',
        goodName: '',
        flowStep: ''
      }
      this.handleSearch()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.size = size
      this.loadInventoryData()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadInventoryData()
    },

    // 查看追溯
    viewTraceability(row) {
      this.$message.info(`查看 ${row.identifyCode} 的追溯信息`)
      // 这里可以打开追溯弹窗
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择至少一个识别码')
        return
      }
      this.$emit('confirm', this.selectedItems)
    },

    // 取消
    handleCancel() {
      this.$emit('cancel')
    },

    // 获取流转步骤标签类型
    getFlowStepTagType(step) {
      const typeMap = {
        'purchase': 'success',
        'transport': 'info',
        'process': 'warning',
        'storage': 'primary',
        'sales': 'danger'
      }
      return typeMap[step] || 'info'
    },

    // 获取货物状态标签类型
    getGoodsStatusTagType(status) {
      const typeMap = {
        'in_stock': 'success',
        'in_transit': 'info',
        'processing': 'warning',
        'completed': 'primary',
        'sold': 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 获取合计方法
    getSummaryMethod(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 5) { // 库存数量列
          const values = data.map(item => Number(item.goodCount) || 0)
          sums[index] = values.reduce((prev, curr) => prev + curr, 0)
          return
        }
        sums[index] = '--'
      })
      return sums
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取流转步骤文本
    getFlowStepText,

    // 获取货物状态文本
    getGoodsStatusText
  }
}
</script>

<style lang="scss" scoped>
.inventory-selector {
  .search-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .low-stock {
    color: #f56c6c;
    font-weight: bold;
  }

  .footer-actions {
    margin-top: 20px;
    text-align: right;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
