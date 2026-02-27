<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :width="width"
    :before-close="handleClose"
    class="lease-order-selector-dialog"
  >
    <div class="lease-order-selector">
      <!-- 搜索区域 -->
      <el-form ref="searchFormRef" :inline="true" :model="searchForm">
        <el-form-item label="订单编号">
          <el-input
            v-model="searchForm.orderCode"
            placeholder="请输入订单编号"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名称"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix><i class="el-input__icon el-icon-search" /></template>
          </el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @change="handleSearch">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已审核" value="APPROVED" />
            <el-option label="已发货" value="SHIPPED" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 租赁订单列表 -->
      <el-table
        v-loading="loading"
        :data="filteredOrderList"
        style="width: 100%"
        highlight-current-row
        border
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <!-- 多选列 -->
        <el-table-column
          v-if="multiple"
          type="selection"
          width="55"
          :selectable="isSelectable"
        />

        <!-- 订单编号列 -->
        <el-table-column prop="orderCode" label="订单编号" min-width="120" />

        <!-- 用户名称列 -->
        <el-table-column prop="userName" label="用户名称" min-width="120" />

        <!-- 订单状态列 -->
        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 订单金额列 -->
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.totalAmount || 0 }}
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column prop="createTime" label="创建时间" width="160" />
      </el-table>

      <!-- 分页 -->
      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>

      <!-- 已选择订单展示 -->
      <div v-if="multiple && selectedOrders.length > 0" class="selected-orders">
        <div class="selected-title">
          <span>已选择订单 ({{ selectedOrders.length }})：</span>
          <el-button type="text" @click="clearSelection">清空选择</el-button>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="order in selectedOrders"
            :key="order.id"
            closable
            style="margin-right: 8px; margin-bottom: 8px;"
            @close="removeOrder(order)"
          >
            {{ order.orderCode }} - {{ order.userName }}
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
import { getLeaseOrderListPage } from '@/api/leaseOrder'

export default {
  name: 'LeaseOrderSelector',
  props: {
    // 弹框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 弹框标题
    title: {
      type: String,
      default: '选择租赁订单'
    },
    // 弹框宽度
    width: {
      type: String,
      default: '900px'
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 每页显示数量
    pageSize: {
      type: Number,
      default: 10
    },
    // 默认选中的订单ID数组
    defaultSelected: {
      type: Array,
      default: () => []
    },
    // 禁用的订单ID数组
    disabledOrders: {
      type: Array,
      default: () => []
    },
    // 订单状态过滤（只显示指定状态的订单）
    statusFilter: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      orderList: [],
      filteredOrderList: [],
      selectedOrders: [],
      searchForm: {
        orderCode: '',
        userName: '',
        status: ''
      },
      currentPage: 1,
      total: 0,
      loading: false
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
      if (this.multiple) {
        return this.selectedOrders.length > 0
      } else {
        return this.selectedOrders.length === 1
      }
    },
    confirmText() {
      if (this.multiple) {
        return `确定选择 (${this.selectedOrders.length})`
      } else {
        return '确定选择'
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData()
      }
    },
    defaultSelected: {
      handler(newVal) {
        this.selectedOrders = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      this.searchForm = {
        orderCode: '',
        userName: '',
        status: ''
      }
      this.currentPage = 1
      await this.fetchOrderList()
    },

    // 获取租赁订单列表
    async fetchOrderList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          orderCode: this.searchForm.orderCode || undefined,
          userName: this.searchForm.userName || undefined,
          status: this.searchForm.status || undefined
        }

        const response = await getLeaseOrderListPage(params)
        if (response && response.data) {
          let orders = response.data.records || []

          // 如果设置了状态过滤，则过滤订单
          if (this.statusFilter && this.statusFilter.length > 0) {
            orders = orders.filter(order => this.statusFilter.includes(order.status))
          }

          this.orderList = orders
          this.total = response.data.total || 0
        }
        this.filteredOrderList = [...this.orderList]
      } catch (error) {
        console.error('获取租赁订单列表失败:', error)
        this.$message.error('获取租赁订单列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch() {
      this.currentPage = 1
      this.fetchOrderList()
    },

    // 分页处理
    handlePageChange(page) {
      this.currentPage = page
      this.fetchOrderList()
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedOrders = selection
    },

    // 行点击处理（单选模式）
    handleRowClick(row, column, event) {
      if (this.multiple) return

      // 单选模式，直接选择该行
      this.selectedOrders = [row]
    },

    // 获取行样式类名
    getRowClassName({ row }) {
      if (this.selectedOrders.some(order => order.id === row.id)) {
        return 'selected-row'
      }
      return ''
    },

    // 判断订单是否可选
    isSelectable(row) {
      return !this.disabledOrders.includes(row.id)
    },

    // 移除已选择的订单
    removeOrder(order) {
      const index = this.selectedOrders.findIndex(o => o.id === order.id)
      if (index > -1) {
        this.selectedOrders.splice(index, 1)
      }
    },

    // 清空选择
    clearSelection() {
      this.selectedOrders = []
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'PENDING': '待审核',
        'APPROVED': '已审核',
        'SHIPPED': '已发货',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      }
      return statusMap[status] || status
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const typeMap = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'SHIPPED': 'primary',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedOrders.length === 0) {
        this.$message.warning('请至少选择一个订单')
        return
      }

      // 向父组件传递选中的订单
      this.$emit('confirm', this.selectedOrders)
      this.handleClose()
    },

    // 关闭弹框
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.lease-order-selector-dialog {
  .lease-order-selector {
    .search-container {
      margin-bottom: 20px;

      .search-input {
        width: 250px;
      }
    }

    .selected-row {
      background-color: #e6f7ff !important;
      border-left: 4px solid #1890ff !important;

      &:hover {
        background-color: #bae7ff !important;
      }
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }

    .selected-orders {
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
        .el-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}

// 全局样式
:deep(.selected-row) {
  background-color: #e6f7ff !important;
  border-left: 4px solid #1890ff !important;

  &:hover {
    background-color: #bae7ff !important;
  }

  td {
    background-color: #e6f7ff !important;
  }
}
</style>
