<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="商品编号" prop="goodNo" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="商品名称" prop="goodName" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="商品类型" prop="goodType" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="商品型号" prop="goodModel" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="总数量" prop="totalQuantity" width="100" align="center">
        <template #default="scope">
          <span class="quantity-text">{{ scope.row.totalQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" prop="totalAmount" width="120" align="center">
        <template #default="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.totalAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="mini" @click="handleViewDetail(scope.row)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="pagination.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 明细弹窗 -->
    <el-dialog
      title="库存明细"
      v-model="detailDialogVisible"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="detail-header">
        <h3>{{ currentGood.goodName }} - 库存明细</h3>
        <p class="good-info">
          <span>商品编号：{{ currentGood.goodNo }}</span>
          <span>商品类型：{{ currentGood.goodType }}</span>
          <span>商品型号：{{ currentGood.goodModel }}</span>
        </p>
      </div>

      <el-table
        v-loading="detailLoading"
        :data="detailList"
        border
        fit
        highlight-current-row
        max-height="400"
      >
        <el-table-column label="货物编号" prop="goodNo" width="120" align="center" show-overflow-tooltip />
        <el-table-column label="货物名称" prop="goodName" width="150" align="center" show-overflow-tooltip />
        <el-table-column label="货物类型" prop="goodType" width="120" align="center" show-overflow-tooltip />
        <el-table-column label="货物型号" prop="goodModel" width="120" align="center" show-overflow-tooltip />
        <el-table-column label="货物数量" prop="goodCount" width="100" align="center">
          <template #default="scope">
            <span class="quantity-text">{{ scope.row.goodCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="货物总价" prop="goodTotalPrice" width="120" align="center">
          <template #default="scope">
            <span class="amount-text">¥{{ formatAmount(scope.row.goodTotalPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="回收订单编号" prop="recycleOrderNo" width="150" align="center" show-overflow-tooltip />
        <el-table-column label="回收订单流向" prop="recycleOrderFlowDirection" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.recycleOrderFlowDirection" size="small" :type="getFlowDirectionTagType(scope.row.recycleOrderFlowDirection)">
              {{ getFlowDirectionText(scope.row.recycleOrderFlowDirection) }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="回收订单类型" prop="recycleOrderType" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.recycleOrderType" size="small" :type="getOrderTypeTagType(scope.row.recycleOrderType)">
              {{ getOrderTypeText(scope.row.recycleOrderType) }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getInventoryReportList, exportInventoryReport, getInventoryDetailList } from '@/api/inventory'
import { parseTime } from '@/utils'
import { getFlowDirectionText as getFlowDirectionTextUtil, getOrderTypeText as getOrderTypeTextUtil, ORDER_TYPE_TAG_TYPE } from '@/constants/orderTypes'

export default {
  name: 'InventoryReport',
  data() {
    return {
      list: [],
      listLoading: false,
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 明细相关数据
      detailDialogVisible: false,
      detailLoading: false,
      detailList: [],
      currentGood: {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.listLoading = true
      const params = {
        current: this.pagination.current,
        size: this.pagination.size
      }

      getInventoryReportList(params).then(response => {
        if (response.code === 200) {
          this.list = response.data.records || []
          this.pagination.total = response.data.total || 0
          this.pagination.current = response.data.current || 1
          this.pagination.size = response.data.size || 10
        } else {
          this.$message.error(response.msg || '获取数据失败')
        }
        this.listLoading = false
      }).catch(error => {
        console.error('获取库存数据失败:', error)
        this.$message.error('获取数据失败')
        this.listLoading = false
      })
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.current = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },

    // 导出数据
    handleExport() {
      this.$confirm('确定要导出库存报表吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.exportData()
      }).catch(() => {
        // 用户取消导出
      })
    },

    // 执行导出
    exportData() {
      exportInventoryReport().then(response => {
        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `库存报表_${new Date().getTime()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      }).catch(error => {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请重试')
      })
    },

    // 格式化金额
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 查看明细
    handleViewDetail(row) {
      this.currentGood = row
      this.detailDialogVisible = true
      this.fetchDetailData(row.goodNo)
    },

    // 获取明细数据
    fetchDetailData(goodNo) {
      this.detailLoading = true

      getInventoryDetailList(goodNo).then(response => {
        if (response.code === 200) {
          this.detailList = response.data || []
        } else {
          this.$message.error(response.msg || '获取明细数据失败')
          this.detailList = []
        }
        this.detailLoading = false
      }).catch(error => {
        console.error('获取库存明细失败:', error)
        this.$message.error('获取明细数据失败')
        this.detailList = []
        this.detailLoading = false
      })
    },

    // 获取流转方向标签类型
    getFlowDirectionTagType(direction) {
      const tagTypeMap = {
        'IN': 'success', // 入库 - 绿色
        'OUT': 'warning' // 出库 - 橙色
      }
      return tagTypeMap[direction] || 'info'
    },

    // 获取订单类型标签类型
    getOrderTypeTagType(type) {
      return ORDER_TYPE_TAG_TYPE(type)
    },

    // 获取流转方向显示文本
    getFlowDirectionText(direction) {
      return getFlowDirectionTextUtil(direction)
    },

    // 获取订单类型显示文本
    getOrderTypeText(type) {
      return getOrderTypeTextUtil(type)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .operation-bar {
    margin-bottom: 20px;
    text-align: right;
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }

  .quantity-text {
    font-weight: 600;
    color: #409eff;
  }

  .amount-text {
    font-weight: 600;
    color: #67c23a;
  }
}

// 表格样式优化
.el-table {
  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #303133;
      font-weight: 600;
    }
  }

  .el-table__body {
    tr:hover {
      background-color: #f5f7fa;
    }
  }
}

// 分页样式
.pagination {
  .el-pagination__total {
    font-weight: 600;
  }
}

// 明细弹窗样式
.detail-header {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;

  h3 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }

  .good-info {
    margin: 0;
    color: #606266;
    font-size: 14px;

    span {
      margin-right: 20px;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
