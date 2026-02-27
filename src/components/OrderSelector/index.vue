<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
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
      <el-form-item label="订单编号">
        <el-input v-model="searchForm.no" placeholder="请输入订单编号" clearable />
      </el-form-item>
      <el-form-item label="订单识别码">
        <el-input v-model="searchForm.identifyCode" placeholder="请输入订单识别码" clearable />
      </el-form-item>
      <el-form-item label="合作方">
        <el-input v-model="searchForm.contractPartnerName" placeholder="请输入合作方名称" clearable />
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
      :row-class-name="getRowClassName"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column
        v-if="multiple"
        type="selection"
        width="55"
        align="center"
      />
      <el-table-column
        v-else
        type="radio"
        width="55"
        align="center"
      >
        <template #default="scope">
          <el-radio
            v-model="selectedOrderId"
            :label="scope.row.id"
            @change="handleRadioChange(scope.row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>

      <el-table-column label="订单编号" prop="no" width="180" align="center" show-overflow-tooltip />
      <el-table-column label="合同名称" prop="contractName" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="订单类型" prop="type" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getOrderTypeTagType(scope.row.type)" size="medium">
            {{ getOrderTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.status)" size="medium">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="甲方" prop="partyAName" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="乙方" prop="partyBName" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="合作方" prop="contractPartnerName" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="经办人" prop="processor" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="订单识别码" prop="identifyCode" width="120" align="center" show-overflow-tooltip />
      <el-table-column v-if="showFlowDirection" label="流转方向" prop="flowDirection" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.flowDirection" size="medium">
            {{ getFlowDirectionText(scope.row.flowDirection) }}
          </el-tag>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="订单总金额" prop="totalAmount" width="120" align="center">
        <template #default="scope">
          <span v-if="scope.row.totalAmount">¥{{ formatAmount(scope.row.totalAmount) }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!canConfirm"
          @click="handleConfirm"
        >
          确定选择
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getRecyclePage } from '@/api/recycle'
import { parseTime } from '@/utils'
import {
  ORDER_TYPE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE_TAG_TYPE,
  getOrderStatusTagType,
  getOrderTypeText,
  getOrderStatusText,
  getFlowDirectionText
} from '@/constants/orderTypes'

export default {
  name: 'OrderSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择订单'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectedOrders: {
      type: Array,
      default: () => []
    },
    // 是否显示流转方向列
    showFlowDirection: {
      type: Boolean,
      default: false
    },
    // 过滤条件
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      orderList: [],
      listLoading: false,
      searchForm: {
        type: '',
        status: '',
        no: '',
        identifyCode: '',
        contractPartnerName: ''
      },
      pagination: {
        page: 1,
        size: 5,
        total: 0
      },
      selectedRows: [],
      selectedOrderId: null,
      // 枚举选项
      orderTypeOptions: ORDER_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      getOrderTypeTagType: ORDER_TYPE_TAG_TYPE,
      getFlowDirectionText
    }
  },
  computed: {
    canConfirm() {
      if (this.multiple) {
        return this.selectedRows.length > 0
      } else {
        return this.selectedOrderId !== null
      }
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal) {
          this.initData()
        }
      },
      immediate: true
    },
    selectedOrders: {
      handler(newVal) {
        if (this.multiple) {
          this.selectedRows = [...newVal]
        } else if (newVal.length > 0) {
          this.selectedOrderId = newVal[0].id
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    initData() {
      this.resetSearchForm()
      this.selectedRows = []
      this.selectedOrderId = null
      this.fetchData()
    },

    // 重置搜索表单
    resetSearchForm() {
      this.searchForm = {
        type: '',
        status: '',
        no: '',
        identifyCode: '',
        contractPartnerName: ''
      }
      // 应用外部传入的过滤条件
      Object.assign(this.searchForm, this.filters)
      this.pagination.page = 1
    },

    // 获取订单数据
    fetchData() {
      this.listLoading = true
      const data = {
        ...this.searchForm,
        page: this.pagination.page,
        size: this.pagination.size
      }

      // 过滤空值
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
          delete data[key]
        }
      })

      getRecyclePage(data).then(response => {
        this.orderList = response.data.records || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取订单数据失败')
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.resetSearchForm()
      this.fetchData()
    },

    // 表格选择变化（多选）
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 单选变化
    handleRadioChange(row) {
      this.selectedRows = [row]
    },

    // 行点击事件
    handleRowClick(row) {
      if (!this.multiple) {
        this.selectedOrderId = row.id
        this.selectedRows = [row]
      }
    },

    // 获取行类名
    getRowClassName({ row }) {
      if (!this.multiple && this.selectedOrderId === row.id) {
        return 'selected-row'
      }
      return ''
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

    // 确认选择
    handleConfirm() {
      if (this.multiple) {
        if (this.selectedRows.length === 0) {
          this.$message.warning('请选择至少一个订单')
          return
        }
        this.$emit('confirm', this.selectedRows)
      } else {
        if (this.selectedOrderId === null) {
          this.$message.warning('请选择一个订单')
          return
        }
        this.$emit('confirm', this.selectedRows)
      }
      this.handleClose()
    },

    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    },

    // 获取订单类型显示文本
    getOrderTypeText,

    // 获取订单状态显示文本
    getOrderStatusText,

    // 获取订单状态标签类型
    getOrderStatusTagType
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 10px;
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

// 选中行样式
::v-deep .selected-row {
  background-color: #f0f9ff;
}

::v-deep .el-table__row:hover {
  cursor: pointer;
}

// 单选按钮样式调整
::v-deep .el-radio {
  margin-right: 0;
}

::v-deep .el-radio__label {
  display: none;
}
</style>
