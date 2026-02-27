<template>
  <div class="app-container">
    <el-page-header :content="'出库单详情 - ' + (detail.outNo || '')" @back="goBack" />

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

      <el-descriptions :column="3" border>
        <el-descriptions-item label="出库单号">{{ detail.outNo }}</el-descriptions-item>
        <el-descriptions-item label="仓库名称">{{ detail.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="出库类型">
          <el-tag :type="getOutboundTypeTag(detail.outType)" size="small">
            {{ getOutboundTypeText(detail.outType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标单号">{{ detail.targetOrderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="目标单ID">{{ detail.targetOrderId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总数量">
          <el-tag type="primary" size="small">{{ detail.totalQuantity || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="确认时间" :span="1">{{ detail.confirmTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人" :span="1">{{ detail.createBy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 出库明细 -->
    <el-card style="margin-top: 20px;" shadow="never">
      <template #header>
        <div class="clearfix">
          <span class="card-title">出库明细</span>
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
        <el-table-column prop="outQuantity" label="出库数量" width="120" align="center">
          <template #default="scope">
            <el-tag type="danger" size="small">{{ scope.row.outQuantity }}</el-tag>
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
        确认出库
      </el-button>
      <el-button
        v-if="detail.status === 'pending'"
        type="danger"
        :loading="cancelLoading"
        @click="handleCancel"
      >
        取消出库单
      </el-button>
    </div>
  </div>
</template>

<script>
import {
  getOutbound,
  getOutboundItems,
  confirmOutbound,
  cancelOutbound
} from '@/api/inventory'
import {
  OUTBOUND_TYPE_MAP,
  ORDER_STATUS_MAP
} from '@/constants/inventory'

export default {
  name: 'OutboundDetail',
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
        // 获取出库单基本信息
        const detailResponse = await getOutbound(id)
        if (detailResponse && detailResponse.data) {
          this.detail = detailResponse.data
        }

        // 获取出库明细
        const itemsResponse = await getOutboundItems(id)
        if (itemsResponse && itemsResponse.data) {
          this.items = itemsResponse.data || []
        }
      } catch (error) {
        console.error('获取出库单详情失败:', error)
        this.$message.error('获取出库单详情失败')
      } finally {
        this.loading = false
      }
    },

    // 确认出库
    handleConfirm() {
      this.$confirm('确定要确认出库吗？确认后将自动更新库存，操作不可撤销。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.confirmLoading = true
        try {
          await confirmOutbound(this.detail.id)
          this.$message.success('确认出库成功')
          this.loadDetail()
        } catch (error) {
          console.error('确认出库失败:', error)
          this.$message.error('确认出库失败')
        } finally {
          this.confirmLoading = false
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 取消出库单
    handleCancel() {
      this.$confirm('确定要取消该出库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.cancelLoading = true
        try {
          await cancelOutbound(this.detail.id)
          this.$message.success('取消成功')
          this.loadDetail()
        } catch (error) {
          console.error('取消出库单失败:', error)
          this.$message.error('取消出库单失败')
        } finally {
          this.cancelLoading = false
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 返回列表
    goBack() {
      this.$router.push('/inventory/outbound')
    },

    // 获取出库类型文本
    getOutboundTypeText(type) {
      return OUTBOUND_TYPE_MAP[type] || type
    },

    // 获取出库类型标签
    getOutboundTypeTag(type) {
      const tagMap = {
        sale: 'success',
        damage: 'danger',
        transfer: 'info',
        other: ''
      }
      return tagMap[type] || ''
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
</style>
