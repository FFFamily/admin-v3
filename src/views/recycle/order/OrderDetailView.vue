<template>
  <el-dialog
    title="订单详情"
    v-model="dialogVisible"
    width="70%"
    :before-close="handleClose"
    append-to-body
    class="order-detail-dialog"
  >
    <div v-if="orderData" class="order-detail-content">
      <!-- 基本信息 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>订单编号：</label>
              <span>{{ orderData.no || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>合同名称：</label>
              <span>{{ orderData.contractName || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>订单类型：</label>
              <el-tag :type="getOrderTypeTagType(orderData.type)" size="medium">
                {{ getOrderTypeText(orderData.type) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>订单状态：</label>
              <el-tag :type="getOrderStatusTagType(orderData.status)" size="medium">
                {{ getOrderStatusText(orderData.status) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>订单识别码：</label>
              <span>{{ orderData.identifyCode || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>经办人：</label>
              <span>{{ orderData.processor || '--' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 合同信息 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>合同信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>甲方：</label>
              <span>{{ orderData.partyAName || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>乙方：</label>
              <span>{{ orderData.partyBName || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>合作方：</label>
              <span>{{ orderData.partner || '--' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 金额信息 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>金额信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="detail-item">
              <label>订单总金额：</label>
              <span class="amount-text">¥{{ formatAmount(orderData.totalAmount) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <label>订单应走金额：</label>
              <span class="amount-text">¥{{ formatAmount(orderData.contractPrice) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <label>订单实走金额：</label>
              <span class="amount-text">¥{{ formatAmount(orderData.totalAmount) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <label>订单应开发票：</label>
              <span class="amount-text">¥{{ formatAmount(orderData.orderAmount) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="detail-item">
              <label>订单实开发票：</label>
              <span class="amount-text">¥{{ formatAmount(orderData.orderAmount) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 时间信息 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>时间信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>起始时间：</label>
              <span>{{ formatDateTime(orderData.startTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>结束时间：</label>
              <span>{{ formatDateTime(orderData.endTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>上传时间：</label>
              <span>{{ formatDateTime(orderData.uploadTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 备注信息 -->
      <el-card v-if="orderData.remark" class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>备注信息</span>
          </div>
        </template>
        <div class="detail-item">
          <span>{{ orderData.remark }}</span>
        </div>
      </el-card>

      <!-- 订单明细 - 使用标签页展示进项和销项 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>订单明细</span>
          </div>
        </template>

        <el-tabs type="card">
          <!-- 进项明细 -->
          <el-tab-pane label="进项明细">
            <template #label>
              <span>
                <i class="el-icon-box" /> 进项明细
                <el-badge v-if="inItems.length > 0" :value="inItems.length" class="item-badge" />
              </span>
            </template>

            <el-table v-loading="itemsLoading" :data="inItems" border fit style="width: 100%">
              <el-table-column prop="goodNo" label="货物编号" width="180" align="center" show-overflow-tooltip />
              <el-table-column prop="goodType" label="货物分类" width="160" align="center" show-overflow-tooltip />
              <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip />
              <el-table-column prop="goodModel" label="货物型号" width="140" align="center" show-overflow-tooltip />
              <el-table-column prop="goodCount" label="货物数量" width="120" align="center">
                <template #default="scope">
                  {{ scope.row.goodCount || '--' }}
                </template>
              </el-table-column>
              <el-table-column prop="goodWeight" label="货物重量" width="120" align="center">
                <template #default="scope">
                  {{ scope.row.goodWeight || '--' }}
                </template>
              </el-table-column>
              <el-table-column prop="goodPrice" label="货物单价" width="120" align="center">
                <template #default="scope">
                  <span v-if="scope.row.goodPrice" class="amount-text">¥{{ formatAmount(scope.row.goodPrice) }}</span>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column prop="goodTotalPrice" label="货物总价" width="140" align="center">
                <template #default="scope">
                  <span v-if="scope.row.goodTotalPrice" class="amount-text">¥{{ formatAmount(scope.row.goodTotalPrice) }}</span>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column prop="goodRemark" label="货物备注" min-width="180" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.goodRemark || '--' }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!inItems || inItems.length === 0" class="no-data">
              <el-empty description="暂无进项明细数据" />
            </div>
          </el-tab-pane>

          <!-- 销项明细 -->
          <el-tab-pane label="销项明细">
            <template #label>
              <span>
                <i class="el-icon-sold-out" /> 销项明细
                <el-badge v-if="outItems.length > 0" :value="outItems.length" class="item-badge" />
              </span>
            </template>

            <el-table v-loading="itemsLoading" :data="outItems" border fit style="width: 100%">
              <el-table-column prop="goodNo" label="货物编号" width="180" align="center" show-overflow-tooltip />
              <el-table-column prop="goodType" label="货物分类" width="160" align="center" show-overflow-tooltip />
              <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip />
              <el-table-column prop="goodModel" label="货物型号" width="140" align="center" show-overflow-tooltip />
              <el-table-column prop="goodCount" label="货物数量" width="120" align="center">
                <template #default="scope">
                  {{ scope.row.goodCount || '--' }}
                </template>
              </el-table-column>
              <el-table-column prop="goodWeight" label="货物重量" width="120" align="center">
                <template #default="scope">
                  {{ scope.row.goodWeight || '--' }}
                </template>
              </el-table-column>
              <el-table-column prop="goodRemark" label="货物备注" min-width="180" show-overflow-tooltip>
                <template #default="scope">
                  {{ scope.row.goodRemark || '--' }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!outItems || outItems.length === 0" class="no-data">
              <el-empty description="暂无销项明细数据" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" icon="el-icon-document" @click="handleApplicationPDF">
          申请单
        </el-button>
        <el-button type="success" icon="el-icon-document" @click="handleSettlementPDF">
          结算单
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { parseTime } from '@/utils'
import { getRecycleDetail } from '@/api/recycle'
import { ORDER_TYPE_TAG_TYPE } from '@/constants/orderTypes'

export default {
  name: 'OrderDetailView',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: null
    },
    orderId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      getOrderTypeTagType: ORDER_TYPE_TAG_TYPE,
      inItems: [], // 进项明细
      outItems: [], // 销项明细
      itemsLoading: false
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
        this.fetchOrderDetail()
      }
    },
    orderData: {
      handler(newVal) {
        if (newVal && newVal.items) {
          // 后端返回统一的 items 数组，前端根据 direction 分离
          const items = newVal.items || []
          this.inItems = items.filter(item => item.direction === 'in')
          this.outItems = items.filter(item => item.direction === 'out')
        } else {
          this.inItems = []
          this.outItems = []
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 获取订单详情
    async fetchOrderDetail() {
      if (this.orderId) {
        this.itemsLoading = true
        try {
          const response = await getRecycleDetail(this.orderId)
          const orderData = response.data
          // 更新订单数据
          this.$emit('update:orderData', orderData)

          // 后端返回统一的 items 数组，前端根据 direction 分离
          const items = orderData.items || []
          this.inItems = items.filter(item => item.direction === 'in')
          this.outItems = items.filter(item => item.direction === 'out')
        } catch (error) {
          this.$message.error('获取订单详情失败')
          console.error('获取订单详情失败:', error)
        } finally {
          this.itemsLoading = false
        }
      } else if (this.orderData && this.orderData.items) {
        // 后端返回统一的 items 数组，前端根据 direction 分离
        const items = this.orderData.items || []
        this.inItems = items.filter(item => item.direction === 'in')
        this.outItems = items.filter(item => item.direction === 'out')
      }
    },

    // 关闭弹窗
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 格式化金额
    formatAmount(amount) {
      if (!amount) return '0.00'
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

    // 生成申请单PDF
    handleApplicationPDF() {
      if (!this.orderData || !this.orderData.id) {
        this.$message.error('订单数据不完整')
        return
      }
      // 跳转到申请单页面
      this.$router.push({
        name: 'ApplicationPDF',
        params: { orderId: this.orderData.id }
      })
    },

    // 生成结算单PDF
    handleSettlementPDF() {
      if (!this.orderData || !this.orderData.id) {
        this.$message.error('订单数据不完整')
        return
      }
      // 跳转到结算单页面
      this.$router.push({
        name: 'SettlementPDF',
        params: { orderId: this.orderData.id }
      })
    }

  }
}
</script>

<style lang="scss" scoped>
.order-detail-dialog {
  .order-detail-content {
    max-height: 60vh;
    overflow-y: auto;
  }

  .detail-card {
    margin-bottom: 20px;

    .card-header {
      font-weight: bold;
      color: #303133;
    }

    .detail-item {
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      label {
        font-weight: 500;
        color: #606266;
        min-width: 120px;
        margin-right: 10px;
      }

      span {
        color: #303133;
        flex: 1;
      }

      .amount-text {
        color: #E6A23C;
        font-weight: bold;
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }

  .no-data {
    text-align: center;
    padding: 40px 0;
  }

  // 标签页徽章样式
  .item-badge {
    margin-left: 8px;

    ::v-deep .el-badge__content {
      background-color: #409eff;
      border: none;
    }
  }
}
</style>
