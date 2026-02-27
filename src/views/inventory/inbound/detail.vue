<template>
  <div class="app-container">
    <el-page-header :content="'入库单详情 - ' + (detail.inNo || '')" @back="goBack" />

    <el-card v-loading="loading" style="margin-top: 20px;" shadow="never">
      <!-- 基本信息 -->
      <template #header>
        <div class="clearfix">
          <span class="card-title">基本信息</span>
          <div style="float: right;">
            <el-tag :type="getOrderStatusTag(detail.status)" size="medium">
              {{ getOrderStatusText(detail.status) }}
            </el-tag>
          </div>
        </div>
      </template>

      <div class="info-list">
        <div class="info-item">
          <div class="info-label">入库单号</div>
          <div class="info-value">{{ detail.inNo || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">仓库名称</div>
          <div class="info-value">{{ detail.warehouseName || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">入库类型</div>
          <div class="info-value">
            <el-tag size="small">{{ getDictLabel('in_bound_type', detail.inType) }}</el-tag>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">来源单号</div>
          <div class="info-value">{{ detail.sourceOrderNo || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">来源单ID</div>
          <div class="info-value">{{ detail.sourceOrderId || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">合作方</div>
          <div class="info-value">{{ detail.contractPartnerName || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">总数量</div>
          <div class="info-value">
            <el-tag type="primary" size="small">{{ detail.totalQuantity || 0 }}</el-tag>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">创建时间</div>
          <div class="info-value">{{ detail.createTime || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">确认时间</div>
          <div class="info-value">{{ detail.confirmTime || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">创建人</div>
          <div class="info-value">{{ detail.createByName || '-' }}</div>
        </div>
        <div class="info-item info-item--full">
          <div class="info-label">备注</div>
          <div class="info-value">{{ detail.remark || '-' }}</div>
        </div>
      </div>
    </el-card>

    <!-- 入库明细 -->
    <el-card style="margin-top: 20px;" shadow="never">
      <template #header>
        <div class="clearfix">
          <span class="card-title">入库明细</span>
        </div>
      </template>

      <el-table
        :data="items"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="goodNo" label="货物编号" width="150" />
        <el-table-column prop="goodName" label="货物名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="goodType" label="货物类型" width="120" />
        <el-table-column prop="goodModel" label="型号" width="120" show-overflow-tooltip />
        <el-table-column prop="inQuantity" label="入库数量" width="120" align="center">
          <template #default="scope">
            <el-tag type="success" size="small">{{ scope.row.inQuantity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>
    </el-card>

    <!-- 操作按钮 -->
    <div style="margin-top: 20px; text-align: center;">
      <el-button @click="goBack">返回列表</el-button>
      <el-button
        v-if="detail.status === 'pending'"
        type="success"
        :loading="confirmLoading"
        @click="handleConfirm"
      >
        确认入库
      </el-button>
      <el-button
        v-if="detail.status === 'pending'"
        type="danger"
        :loading="cancelLoading"
        @click="handleCancel"
      >
        取消入库单
      </el-button>
    </div>
  </div>
</template>

<script>
import {
  getInbound,
  getInboundItems,
  confirmInbound,
  cancelInbound
} from '@/api/inventory'
import { ORDER_STATUS_MAP } from '@/constants/inventory'
import { dictMixin } from '@/utils/dict'

export default {
  name: 'InboundDetail',
  mixins: [dictMixin],
  dicts: ['in_bound_type'],
  data() {
    return {
      loading: false,
      confirmLoading: false,
      cancelLoading: false,
      detail: {},
      items: []
    }
  },
  mounted() {
    this.loadDetail()
  },
  methods: {
    // 加载详情
    async loadDetail() {
      const id = this.$route.params.id
      if (!id) {
        this.$message.error('参数错误')
        this.goBack()
        return
      }

      this.loading = true
      try {
        // 获取入库单基本信息
        const detailResponse = await getInbound(id)
        if (detailResponse && detailResponse.data) {
          this.detail = detailResponse.data
        }

        // 获取入库明细
        const itemsResponse = await getInboundItems(id)
        if (itemsResponse && itemsResponse.data) {
          this.items = itemsResponse.data || []
        }
      } catch (error) {
        console.error('获取入库单详情失败:', error)
        this.$message.error('获取入库单详情失败')
      } finally {
        this.loading = false
      }
    },

    // 确认入库
    handleConfirm() {
      this.$confirm('确定要确认入库吗？确认后将自动更新库存，操作不可撤销。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.confirmLoading = true
        try {
          await confirmInbound(this.detail.id)
          this.$message.success('确认入库成功')
          this.loadDetail()
        } catch (error) {
          console.error('确认入库失败:', error)
          this.$message.error('确认入库失败')
        } finally {
          this.confirmLoading = false
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 取消入库单
    handleCancel() {
      this.$confirm('确定要取消该入库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.cancelLoading = true
        try {
          await cancelInbound(this.detail.id)
          this.$message.success('取消成功')
          this.loadDetail()
        } catch (error) {
          console.error('取消入库单失败:', error)
          this.$message.error('取消入库单失败')
        } finally {
          this.cancelLoading = false
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 返回列表
    goBack() {
      this.$router.push('/inventory/inbound')
    },

    // 获取状态文本
    getOrderStatusText(status) {
      return ORDER_STATUS_MAP[status] || status
    },

    // 获取状态标签
    getOrderStatusTag(status) {
      const tagMap = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'info'
      }
      return tagMap[status] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .card-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }
}

.info-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 12px 16px;

  .info-item {
    display: flex;
    align-items: center;

    .info-label {
      width: 90px;
      color: #606266;
      font-weight: 500;
      flex-shrink: 0;
    }

    .info-value {
      color: #303133;
      word-break: break-all;
    }
  }

  .info-item--full {
    grid-column: 1 / -1;
    align-items: flex-start;

    .info-label {
      margin-top: 2px;
    }
  }
}
</style>
