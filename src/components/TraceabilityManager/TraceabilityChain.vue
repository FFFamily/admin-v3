<template>
  <div class="traceability-chain">
    <div v-loading="loading" class="chain-content">
      <!-- 追溯链时间轴 -->
      <el-timeline v-if="traceabilityData.length > 0 && traceabilityData">
        <el-timeline-item v-for="(nodeOrders, nodeIndex) in traceabilityData" :key="nodeIndex" placement="top">
          <el-card v-if="nodeOrders && nodeOrders.length > 0" class="timeline-card" shadow="hover">
            <div class="card-header">
              <div class="step-info">
                <span class="node-title">节点 {{ nodeIndex + 1 }}</span>
                <el-tag size="small" type="info">{{ nodeOrders.length }} 个订单</el-tag>
              </div>
            </div>

            <div class="card-content">
              <!-- 该节点下的所有订单 -->
              <el-collapse v-if="nodeOrders.length > 1" accordion>
                <template v-for="(order, orderIndex) in nodeOrders">
                  <el-collapse-item
                    v-if="order && order.context"
                    :key="orderIndex"
                    :name="String(orderIndex)"
                    :class="{ 'current-order-item': isCurrentOrder(order) }"
                  >
                    <template #title>
                      <div class="order-title">
                        <el-tag :type="getFlowStepTagType(order.context.type)" size="small">
                          {{ getOrderTypeText(order.context.type) }}
                        </el-tag>
                        <span class="order-no">{{ order.context.identifyCode }}</span>
                        <el-tag v-if="isCurrentOrder(order)" type="warning" size="mini" effect="dark" class="current-tag">
                          当前订单
                        </el-tag>
                      </div>
                    </template>
                    <el-form label-width="80px" size="small" class="order-info-form">
                      <el-row :gutter="20">
                        <el-col :span="12">
                          <el-form-item label="订单ID">
                            <span>{{ order.orderId || '--' }}</span>
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="订单编号">
                            <span>{{ order.context.no || '--' }}</span>
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="订单类型">
                            <el-tag :type="getFlowStepTagType(order.context.type)" size="small">
                              {{ getOrderTypeText(order.context.type) }}
                            </el-tag>
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="识别码">
                            <span>{{ order.context.identifyCode || '--' }}</span>
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-form>
                  </el-collapse-item>
                </template>
              </el-collapse>

              <!-- 单个订单也使用折叠面板展示 -->
              <el-collapse v-else-if="nodeOrders.length === 1 && nodeOrders[0] && nodeOrders[0].context" accordion>
                <el-collapse-item name="0" :class="{ 'current-order-item': isCurrentOrder(nodeOrders[0]) }">
                  <template #title>
                    <div class="order-title">
                      <el-tag :type="getFlowStepTagType(nodeOrders[0].context.type)" size="small">
                        {{ getOrderTypeText(nodeOrders[0].context.type) }}
                      </el-tag>
                      <span class="order-no">{{ nodeOrders[0].context.identifyCode }}</span>
                      <el-tag v-if="isCurrentOrder(nodeOrders[0])" type="warning" size="mini" effect="dark" class="current-tag">
                        当前订单
                      </el-tag>
                    </div>
                  </template>
                  <el-form label-width="80px" size="small" class="order-info-form">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="订单ID">
                          <span>{{ nodeOrders[0].orderId || '--' }}</span>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="订单编号">
                          <span>{{ nodeOrders[0].context.no || '--' }}</span>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="订单类型">
                          <el-tag :type="getFlowStepTagType(nodeOrders[0].context.type)" size="small">
                            {{ getOrderTypeText(nodeOrders[0].context.type) }}
                          </el-tag>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="识别码">
                          <span>{{ nodeOrders[0].context.identifyCode || '--' }}</span>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <!-- <el-empty v-else-if="!loading" description="暂无追溯数据" :image-size="100" /> -->
    </div>

    <!-- 关系图谱 -->
    <el-divider content-position="left">关系图谱</el-divider>
    <div v-if="graphData && Object.keys(graphData).length > 0">
      <relationship-graph :graph-data="graphData" :all-orders="allOrders" :current-order-id="orderId" :current-identify-code="identifyCode" />
    </div>
    <!-- <el-empty v-else description="暂无数据生成关系图谱" :image-size="100" /> -->
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import {
  getFlowStepText,
  getChangeReasonText,
  getGoodsStatusText
} from '@/constants/traceability'
import { getTraceabilityChain } from '@/api/traceability'
import RelationshipGraph from './RelationshipGraph.vue'

export default {
  name: 'TraceabilityChain',
  components: {
    RelationshipGraph
  },
  props: {
    identifyCode: {
      type: String,
      default: ''
    },
    orderId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      searchIdentifyCode: '',
      traceabilityData: [],
      graphData: {},
      allOrders: [],
      loading: false
    }
  },
  watch: {
    orderId(newVal) {
      if (newVal) {
        this.loadTraceabilityChain()
      }
    },
    identifyCode(newVal) {
      if (newVal && !this.orderId) {
        this.searchIdentifyCode = newVal
      }
    }
  },
  mounted() {
    // 自动加载追溯链数据
    this.autoLoadTraceabilityChain()
  },
  methods: {
    // 自动加载追溯链数据
    autoLoadTraceabilityChain() {
      if (this.orderId) {
        // 优先使用订单ID加载
        this.loadTraceabilityChain()
      } else if (this.identifyCode) {
        // 设置识别码（暂不自动加载，等用户点击按钮）
        this.searchIdentifyCode = this.identifyCode
      }
    },

    // 加载追溯链数据
    async loadTraceabilityChain() {
      // 优先使用传入的 orderId，否则使用 searchIdentifyCode
      const queryParam = this.orderId || this.searchIdentifyCode

      if (!queryParam) {
        this.$message.warning('请提供订单ID')
        return
      }

      this.loading = true
      try {
        // 使用真实API调用，传入订单ID
        const response = await getTraceabilityChain(queryParam)

        // 新数据结构
        // response.data 格式：{ graph: {...}, paths: [...], allOrders: [...] }
        this.graphData = response.data.graph || {}
        this.traceabilityData = response.data.paths || []
        this.allOrders = response.data.allOrders || []

        // 调试：打印数据结构
        console.log('追溯链数据:', this.traceabilityData)
        console.log('关系图数据:', this.graphData)
        console.log('所有订单数据:', this.allOrders)

        if (this.traceabilityData.length === 0) {
          this.$message.info('未找到相关追溯数据')
        }
      } catch (error) {
        this.$message.error('加载追溯数据失败2')
        console.error('追溯数据加载失败:', error)
        this.traceabilityData = []
      } finally {
        this.loading = false
      }
    },

    // 获取时间轴类型
    getTimelineType(flowStep) {
      const typeMap = {
        'purchase': 'success',
        'transport': 'info',
        'process': 'warning',
        'storage': 'primary',
        'sales': 'danger',
        'current': 'primary'
      }
      return typeMap[flowStep] || 'info'
    },

    // 获取时间轴图标
    getTimelineIcon(flowStep) {
      const iconMap = {
        'purchase': 'el-icon-shopping-cart-2',
        'transport': 'el-icon-truck',
        'process': 'el-icon-setting',
        'storage': 'el-icon-box',
        'sales': 'el-icon-sell',
        'current': 'el-icon-star-on'
      }
      return iconMap[flowStep] || 'el-icon-info'
    },

    // 获取流转步骤标签类型
    getFlowStepTagType(step) {
      const typeMap = {
        'purchase': 'success',
        'transport': 'info',
        'process': 'warning',
        'storage': 'primary',
        'sales': 'danger',
        'current': 'primary'
      }
      return typeMap[step] || 'info'
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

    // 跳转到订单
    jumpToOrder(orderId) {
      this.$message.info(`订单ID: ${orderId}`)
      // 可以实现跳转到订单详情
    },

    // 获取节点的时间轴类型（基于第一个订单）
    getNodeTimelineType(nodeOrders) {
      if (!nodeOrders || nodeOrders.length === 0 || !nodeOrders[0] || !nodeOrders[0].context) return 'info'
      return this.getTimelineType(nodeOrders[0].context.type)
    },

    // 获取节点的时间轴图标（基于第一个订单）
    getNodeTimelineIcon(nodeOrders) {
      if (!nodeOrders || nodeOrders.length === 0 || !nodeOrders[0] || !nodeOrders[0].context) return 'el-icon-info'
      return this.getTimelineIcon(nodeOrders[0].context.type)
    },

    // 导出追溯数据
    exportTraceabilityData() {
      if (this.traceabilityData.length === 0) {
        this.$message.warning('暂无数据可导出')
        return
      }

      // 实现导出逻辑
      this.$message.success('导出功能开发中...')
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取流转步骤文本
    getFlowStepText,

    // 获取变更原因文本
    getChangeReasonText,

    // 获取货物状态文本
    getGoodsStatusText,

    // 判断是否是当前订单
    isCurrentOrder(order) {
      if (!order) return false
      // 优先通过 orderId 匹配
      if (this.orderId && order.orderId) {
        return String(order.orderId) === String(this.orderId)
      }
      // 如果没有 orderId，通过 identifyCode 匹配
      if (this.identifyCode && order.context && order.context.identifyCode) {
        return order.context.identifyCode === this.identifyCode
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.traceability-chain {
  .chain-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .chain-content {
    min-height: 400px;
  }

  .timeline-card {
    margin-bottom: 10px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .step-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .identify-code {
          font-family: monospace;
          font-weight: bold;
          color: #409eff;
        }
      }
    }

    .card-content {

      .goods-section,
      .source-section,
      .operation-section {
        margin-bottom: 15px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 14px;
        }
      }

      .source-codes {
        .source-tag {
          margin-right: 8px;
          margin-bottom: 8px;
          cursor: pointer;

          .change-reason {
            font-size: 12px;
            opacity: 0.8;
          }

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .relationship-graph {
    min-height: 300px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    .graph-placeholder {
      text-align: center;
      color: #909399;
    }
  }

  .order-no {
    margin-left: 10px;
  }

  .node-title {
    font-weight: bold;
    font-size: 14px;
    color: #303133;
  }

  .order-title {
    display: flex;
    align-items: center;
    width: 100%;
  }

  // 当前订单高亮样式
  ::v-deep .current-order-item {
    .el-collapse-item__header {
      background-color: #fdf6ec;
      border-left: 3px solid #e6a23c;
      padding-left: 8px;
      
      &:hover {
        background-color: #faecd8;
      }
    }
  }

  .current-tag {
    margin-left: 10px;
    font-weight: bold;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
}

// 订单信息表单样式
.order-info-form {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;

  ::v-deep .el-form-item {
    margin-bottom: 10px;

    .el-form-item__label {
      font-weight: 600;
      color: #606266;
    }

    .el-form-item__content {
      span {
        color: #303133;
      }
    }
  }
}
</style>
