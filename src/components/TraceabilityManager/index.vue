<template>
  <div class="traceability-manager">
    <!-- 识别码管理区域 -->
    <el-card class="identify-code-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>订单识别码管理</span>
          <el-button type="primary" size="small" @click="showTraceabilityDialog">
            查看追溯链
          </el-button>
        </div>
      </template>

      <el-alert
        title="说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 15px;"
      >
        <div>
          <p style="margin: 5px 0;">每个订单只有一个主识别码，订单中的所有货物都使用此识别码</p>
          <p style="margin: 5px 0;">用户可以手动选择使用进项或销项明细，根据实际业务需要决定</p>
          <p style="margin: 5px 0;">源识别码用于追溯货物的来源和流转历程</p>
        </div>
      </el-alert>

      <!-- 当前识别码 -->
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单识别码" required>
              <el-input
                v-model="localIdentifyCode"
                placeholder="请手动输入订单识别码"
                :disabled="!canEditIdentifyCode"
              />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>

      <!-- 源识别码管理 -->
      <el-divider content-position="left">源识别码</el-divider>
      <div class="source-codes-section">
        <el-button type="success" size="small" @click="addSourceCode">
          添加源识别码
        </el-button>
      </div>

      <el-table
        v-if="sourceCodes.length > 0"
        :data="sourceCodes"
        border
        size="small"
        style="margin-top: 10px;"
      >
        <el-table-column prop="identifyCode" label="源识别码" width="250">
          <template #default="scope">
            <div style="display: flex; gap: 5px; align-items: center;">
              <el-input
                v-model="scope.row.identifyCode"
                placeholder="请输入源识别码"
                size="small"
                style="flex: 1;"
              />
              <el-button
                type="primary"
                size="mini"
                :disabled="!scope.row.identifyCode"
                @click="showRelatedOrdersDialog(scope.$index)"
              >
                选择订单
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderType" label="来源订单类型" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.orderType" size="small" :type="getOrderTypeTagType(scope.row.orderType)">
              {{ getOrderTypeText(scope.row.orderType) }}
            </el-tag>
            <span v-else style="color: #909399;">未选择</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="来源订单编码" width="200" align="center">
          <template #default="scope">
            <span v-if="scope.row.orderNo">{{ scope.row.orderNo }}</span>
            <span v-else style="color: #909399;">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeReason" label="变更原因" width="150">
          <template #default="scope">
            <el-select
              v-model="scope.row.changeReason"
              placeholder="选择原因"
              size="small"
            >
              <el-option
                v-for="option in changeReasonOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeSourceCode(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 追溯链查看弹窗 -->
    <el-dialog
      title="货物追溯链"
      v-model="traceabilityDialogVisible"
      width="80%"
      :close-on-click-modal="false"
      append-to-body
    >
      <traceability-chain
        v-if="traceabilityDialogVisible"
        :identify-code="localIdentifyCode"
        :order-id="currentOrderId"
      />
    </el-dialog>

    <!-- 关联订单选择弹窗 -->
    <el-dialog
      title="选择关联订单"
      v-model="relatedOrdersDialogVisible"
      width="60%"
      append-to-body
      :close-on-click-modal="false"
    >
      <div v-loading="relatedOrdersLoading">
        <el-table
          :data="relatedOrders"
          border
          size="small"
          max-height="500"
          :row-class-name="getRowClassName"
        >
          <el-table-column prop="no" label="订单编码" width="200" align="center" show-overflow-tooltip />
          <el-table-column prop="identifyCode" label="订单识别码" width="200" align="center" show-overflow-tooltip />
          <el-table-column prop="type" label="订单类型" width="120" align="center">
            <template #default="scope">
              <el-tag size="small" :type="getOrderTypeTagType(scope.row.type)">
                {{ getOrderTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标识" width="100" align="center">
            <template #default="scope">
              <el-tag
                v-if="isCurrentOrder(scope.row)"
                type="warning"
                size="mini"
                effect="plain"
              >
                当前订单
              </el-tag>
              <el-tag
                v-else-if="isOrderSelected(scope.row)"
                type="success"
                size="mini"
                effect="plain"
              >
                已选择
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="mini"
                :disabled="isCurrentOrder(scope.row) || isOrderSelected(scope.row)"
                @click="handleSelectOrder(scope.row)"
              >
                {{ getButtonText(scope.row) }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-if="!relatedOrdersLoading && relatedOrders.length === 0"
          description="没有找到相关订单"
          :image-size="100"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getFlowStepText,
  getChangeReasonText
} from '@/constants/traceability'
import { getOrdersByIdentifyCode } from '@/api/recycle'
import { dictMixin } from '@/utils/dict'
import TraceabilityChain from './TraceabilityChain.vue'

export default {
  name: 'TraceabilityManager',
  components: {
    TraceabilityChain
  },
  mixins: [dictMixin],
  dicts: ['order_change_reason'],
  props: {
    // 订单识别码（来自订单的 identifyCode 字段）
    identifyCode: {
      type: String,
      default: ''
    },
    // 源识别码列表
    value: {
      type: Array,
      default: () => []
    },
    orderType: {
      type: String,
      default: ''
    },
    canEditIdentifyCode: {
      type: Boolean,
      default: true
    },
    // 当前订单ID（用于追溯链查询）
    currentOrderId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      localIdentifyCode: '',
      sourceCodes: [],
      traceabilityDialogVisible: false,
      relatedOrdersDialogVisible: false,
      relatedOrders: [],
      relatedOrdersLoading: false,
      currentSelectingIndex: null, // 当前正在选择关联订单的源识别码索引
      isUpdating: false // 防止循环更新的标志
    }
  },
  computed: {
    // 从字典数据中获取变更原因选项
    changeReasonOptions() {
      const dictData = this.dict.order_change_reason || []
      // 确保数据格式正确，映射为 { label, value } 格式
      return dictData.map(item => ({
        label: item.label || item.dictLabel,
        value: item.value || item.dictValue
      }))
    }
  },
  watch: {
    identifyCode: {
      handler(newVal) {
        if (!this.isUpdating) {
          this.localIdentifyCode = newVal || ''
        }
      },
      immediate: true
    },
    value: {
      handler(newVal) {
        if (!this.isUpdating) {
          this.sourceCodes = Array.isArray(newVal) ? newVal : []
        }
      },
      immediate: true,
      deep: true
    },
    localIdentifyCode() {
      this.emitIdentifyCodeChange()
    },
    sourceCodes: {
      handler() {
        this.emitSourceCodesChange()
      },
      deep: true
    },
    // 监听字典数据加载
    'dict.order_change_reason': {
      handler(newVal) {
        console.log('字典数据 order_change_reason 已加载:', newVal)
        console.log('处理后的选项:', this.changeReasonOptions)
      },
      deep: true
    }
  },
  methods: {
    // 添加源识别码
    addSourceCode() {
      this.sourceCodes.push({
        identifyCode: '',
        orderType: '',
        orderId: null,
        orderNo: '',
        goodName: '',
        goodCount: 0,
        goodWeight: '',
        changeReason: 'initial'
      })
    },

    // 移除源识别码
    removeSourceCode(index) {
      this.sourceCodes.splice(index, 1)
    },

    // 显示追溯链弹窗
    showTraceabilityDialog() {
      if (!this.localIdentifyCode) {
        this.$message.warning('请先输入识别码')
        return
      }
      this.traceabilityDialogVisible = true
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

    // 获取流转步骤文本
    getFlowStepText,

    // 获取变更原因文本
    getChangeReasonText,

    // 发送识别码变更事件
    emitIdentifyCodeChange() {
      this.isUpdating = true
      this.$emit('update:identifyCode', this.localIdentifyCode)
      this.$emit('identify-code-change', this.localIdentifyCode)
      this.$nextTick(() => {
        this.isUpdating = false
      })
    },

    // 发送源识别码列表变更事件
    emitSourceCodesChange() {
      this.isUpdating = true
      this.$emit('input', this.sourceCodes)
      this.$emit('change', this.sourceCodes)
      this.$nextTick(() => {
        this.isUpdating = false
      })
    },

    // 显示关联订单弹窗
    async showRelatedOrdersDialog(index) {
      const sourceCode = this.sourceCodes[index]
      if (!sourceCode.identifyCode) {
        this.$message.warning('请先输入源识别码')
        return
      }

      this.currentSelectingIndex = index
      this.relatedOrdersDialogVisible = true
      this.relatedOrdersLoading = true
      this.relatedOrders = []

      try {
        const response = await getOrdersByIdentifyCode(sourceCode.identifyCode)
        this.relatedOrders = response.data || []

        if (this.relatedOrders.length === 0) {
          this.$message.info('未找到相关订单')
        }
      } catch (error) {
        console.error('获取关联订单失败:', error)
        this.$message.error('获取关联订单失败')
      } finally {
        this.relatedOrdersLoading = false
      }
    },

    // 选择订单
    handleSelectOrder(order) {
      if (this.currentSelectingIndex !== null) {
        // 更新对应行的数据
        const target = this.sourceCodes[this.currentSelectingIndex]
        if (target) {
          target.orderId = order.id
          target.orderNo = order.no
          target.orderType = order.type
        }

        this.$message.success(`已关联订单：${order.no}`)
        this.relatedOrdersDialogVisible = false
        this.currentSelectingIndex = null
      }
    },

    // 获取订单类型标签类型
    getOrderTypeTagType(type) {
      const typeMap = {
        'purchase': 'success',
        'transport': 'info',
        'process': 'warning',
        'storage': 'primary',
        'sales': 'danger'
      }
      return typeMap[type] || 'info'
    },

    // 获取订单类型文本
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

    // 判断是否为当前订单
    isCurrentOrder(order) {
      // 通过订单编号判断是否为当前订单
      return order.no === this.currentOrderNo && this.currentOrderNo !== ''
    },

    // 判断订单是否已经被选择
    isOrderSelected(order) {
      // 检查订单编号是否已经在源识别码列表中
      return this.sourceCodes.some(sourceCode => sourceCode.orderNo === order.no)
    },

    // 获取按钮文本
    getButtonText(order) {
      if (this.isCurrentOrder(order)) {
        return '当前订单'
      } else if (this.isOrderSelected(order)) {
        return '已选择'
      } else {
        return '选择'
      }
    },

    // 获取表格行样式类名
    getRowClassName({ row }) {
      if (this.isCurrentOrder(row)) {
        return 'current-order-row'
      } else if (this.isOrderSelected(row)) {
        return 'selected-order-row'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.traceability-manager {
  .identify-code-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .source-codes-section {
    margin-bottom: 10px;

    .el-button {
      margin-right: 10px;
    }
  }

  .goods-info {
    .goods-detail {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  // 当前订单行样式
  :deep(.current-order-row) {
    background-color: #fdf6ec !important;

    &:hover {
      background-color: #faecd8 !important;
    }

    td {
      border-color: #f5dab1 !important;
    }
  }

  // 已选择订单行样式
  :deep(.selected-order-row) {
    background-color: #f0f9ff !important;

    &:hover {
      background-color: #e1f5fe !important;
    }

    td {
      border-color: #b3e5fc !important;
    }
  }
}
</style>
