<template>
  <el-dialog
    title="订单列表"
    v-model="dialogVisible"
    width="80%"
    :before-close="handleClose"
    append-to-body
    class="order-list-dialog"
  >
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
      <el-form-item label="订单类型">
        <el-select v-model="searchForm.type" placeholder="请选择订单类型" clearable>
          <el-option
            v-for="option in orderTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="option in orderStatusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单识别码">
        <el-input v-model="searchForm.identifyCode" placeholder="请输入订单识别码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 订单列表表格 -->
    <el-table
      v-loading="listLoading"
      :data="orderList"
      border
      fit
      highlight-current-row
      max-height="400"
      @sort-change="handleSortChange"
    >
      <el-table-column label="订单编号" prop="no" width="200" align="center" show-overflow-tooltip />
      <el-table-column label="合同名称" prop="contractName" width="180" align="center" show-overflow-tooltip />
      <el-table-column label="订单类型" prop="type" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getOrderTypeTagType(scope.row.type)" size="medium">
            {{ getOrderTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" prop="totalAmount" width="150" align="center">
        <template #default="scope">
          <span v-if="scope.row.totalAmount" class="amount-text">¥{{ formatAmount(scope.row.totalAmount) }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="起始时间" prop="startTime" width="180" align="center" sortable="custom">
        <template #default="scope">
          {{ formatDateTime(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="endTime" width="180" align="center" sortable="custom">
        <template #default="scope">
          {{ formatDateTime(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.status)" size="medium">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button size="mini" type="primary" icon="el-icon-view" @click="handleViewDetail(scope.row)">
            查看
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-refresh" @click="handleSyncOrder(scope.row)">
            同步订单明细
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 订单详情查看弹窗 -->
    <order-detail-view
      v-model:visible="detailVisible"
      v-model:orderData="currentOrder"
      :order-id="currentOrder ? currentOrder.id : null"
      @close="handleDetailClose"
    />
  </el-dialog>
</template>

<script>
import { getRecyclePage, syncOrder, getRecycleDetail } from '@/api/recycle'
import { parseTime } from '@/utils'
import OrderDetailView from './OrderDetailView.vue'
import {
  ORDER_TYPE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE_TAG_TYPE
} from '@/constants/orderTypes'

export default {
  name: 'OrderListDialog',
  components: { OrderDetailView },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      orderList: [],
      listLoading: false,
      searchForm: {
        type: '',
        status: '',
        identifyCode: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      detailVisible: false,
      currentOrder: null,
      // 枚举选项
      orderTypeOptions: ORDER_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      getOrderTypeTagType: ORDER_TYPE_TAG_TYPE
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
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetData()
        this.fetchData()
      }
    }
  },
  methods: {
    // 重置数据
    resetData() {
      this.searchForm = {
        type: '',
        status: '',
        identifyCode: ''
      }
      this.pagination = {
        page: 1,
        size: 10,
        total: 0
      }
      this.detailVisible = false
      this.currentOrder = null
    },

    // 获取订单列表数据
    fetchData() {
      this.listLoading = true
      const params = {
        identifyCode: this.searchForm.identifyCode || undefined,
        type: this.searchForm.type || undefined,
        status: this.searchForm.status || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }

      getRecyclePage(params).then(response => {
        this.orderList = response.data.records || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取订单列表失败')
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        type: '',
        status: '',
        identifyCode: ''
      }
      this.pagination.page = 1
      this.fetchData()
    },

    // 排序变化
    handleSortChange({ column, prop, order }) {
      console.log('排序变化:', prop, order)
      // 这里可以添加排序逻辑
    },

    // 查看订单详情
    handleViewDetail(row) {
      this.currentOrder = row
      this.detailVisible = true
    },

    // 同步订单明细
    handleSyncOrder(row) {
      this.$confirm('确定要同步该订单的明细吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.syncOrderItems(row)
      }).catch(() => {
        // 用户取消
      })
    },

    // 执行同步订单
    async syncOrderData(orderId) {
      try {
        await syncOrder(orderId)
        this.$message.success('订单同步成功')
        this.fetchData() // 刷新列表
      } catch (error) {
        this.$message.error('订单同步失败')
        console.error('同步订单失败:', error)
      }
    },

    // 同步订单明细
    async syncOrderItems(row) {
      try {
        // 获取源订单的详情
        const response = await getRecycleDetail(row.id)
        const sourceOrderData = response.data
        const sourceItems = sourceOrderData.items || []

        if (sourceItems.length === 0) {
          this.$message.warning('该订单没有明细数据')
          return
        }

        // 发出同步事件，传递源订单明细数据
        this.$emit('sync-items', {
          sourceOrderId: row.id,
          sourceOrderNo: row.no,
          sourceOrderName: row.contractName,
          items: sourceItems
        })

        this.$message.success('订单明细同步成功')
        this.handleClose() // 关闭弹窗
      } catch (error) {
        this.$message.error('获取订单明细失败')
        console.error('同步订单明细失败:', error)
      }
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },

    // 关闭弹窗
    handleClose() {
      this.$emit('update:visible', false)
    },

    // 详情弹窗关闭
    handleDetailClose() {
      this.detailVisible = false
      this.currentOrder = null
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取订单类型显示文本
    getOrderTypeText(type) {
      const textMap = {
        'purchase': '采购订单',
        'transport': '运输订单',
        'process': '加工订单',
        'sales': '销售订单',
        'storage': '仓储订单',
        'other': '其他订单'
      }
      return textMap[type] || '未知类型'
    },

    // 获取订单状态显示文本
    getOrderStatusText(status) {
      const textMap = {
        'processing': '执行中',
        'completed': '已结算',
        'uploaded': '已上传'
      }
      return textMap[status] || '未知状态'
    },

    // 获取订单状态标签类型
    getOrderStatusTagType(status) {
      const tagTypeMap = {
        'processing': 'warning',
        'completed': 'success',
        'uploaded': 'info'
      }
      return tagTypeMap[status] || 'info'
    },

    // 格式化金额
    formatAmount(amount) {
      if (!amount) return '0.00'
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-dialog {
  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }

  .dialog-footer {
    text-align: right;
  }

  .amount-text {
    color: #E6A23C;
    font-weight: bold;
  }
}
</style>
