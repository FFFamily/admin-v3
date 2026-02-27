<template>
  <div class="purchase-item">
    <!-- 订单明细 -->
    <el-divider content-position="left">进项订单明细</el-divider>
    <el-form>
      <el-form-item>
        <el-button type="primary" @click="clearAllPrices">货物单价清零</el-button>
        <el-button type="primary" @click="addOrderItem">新增行</el-button>
        <el-button type="success" icon="el-icon-refresh" @click="openOrderListDialog">同步订单明细</el-button>
        <el-button type="danger" :disabled="selectedItems.length === 0" @click="deleteSelectedItems">删除行</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="itemsLoading"
      :data="items"
      border
      fit
      style="width: 100%"
      :show-summary="true"
      :summary-method="getPurchaseSummary"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="goodNo" label="货物编号" fixed="left" width="180" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.goodNo" placeholder="选择货物" :disabled="!scope.row.goodNo" readonly>
            <template #append>
              <el-button icon="el-icon-search" @click="openBusinessScopeSelector(scope.$index)" />
            </template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="goodType" label="货物分类" width="160" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.goodType" placeholder="请输入货物分类" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          <el-input v-model="scope.row.goodName" placeholder="请输入货物名称" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodModel" label="货物型号" width="140" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.goodModel" placeholder="请输入货物型号" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodCount" label="货物数量" width="155" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.goodCount"
            style="width:130px;"
            :min="1"
            :precision="0"
            :disabled="!scope.row.goodNo"
            @change="onItemFieldChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="goodWeight" label="货物重量(kg)" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.goodWeight"
            :min="0"
            :precision="2"
            controls-position="right"
            placeholder="请输入货物重量"
            :disabled="!scope.row.goodNo"
            style="width: 130px;"
            @change="onItemFieldChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="goodPrice" label="货物单价" width="210" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.goodPrice"
            :min="0"
            :precision="2"
            :disabled="!scope.row.goodNo"
            @change="onItemFieldChange(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column prop="goodRemark" label="货物备注" min-width="180">
        <template #default="scope">
          <el-input v-model="scope.row.goodRemark" placeholder="请输入备注" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column label="评级系数" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.ratingCoefficient"
            :precision="4"
            controls-position="right"
            placeholder="评级系数"
            :disabled="!scope.row.goodNo"
            style="width: 130px;"
            @change="onItemFieldChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="其他调价" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.otherAdjustAmount"
            :precision="2"
            controls-position="right"
            placeholder="其他调价"
            :disabled="!scope.row.goodNo"
            style="width: 130px;"
            @change="onItemFieldChange(scope.row)"
          />
        </template>
      </el-table-column>
      <!-- 移除货物识别码列，使用订单主识别码 -->
      <!-- <el-table-column label="订单金额" width="210" align="center">
        <template #default="scope">
          <el-input-number v-model="scope.row.orderAmount" placeholder="订单金额" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column> -->
      <el-table-column prop="goodTotalPrice" label="货物总价" width="160" align="center">
        <template #default="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.goodTotalPrice) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 经营范围选择器 -->
    <BusinessScopeSelector
      v-model:visible="businessScopeSelectorVisible"
      title="选择经营范围"
      :multiple="false"
      :only-show-enabled="true"
      @confirm="handleBusinessScopeConfirm"
      @close="handleBusinessScopeClose"
    />

    <!-- 订单列表弹窗组件 -->
    <order-list-dialog v-model:visible="orderListVisible" @sync-items="handleSyncOrderItems" />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'
import OrderListDialog from '../OrderListDialog.vue'

export default {
  name: 'PurchaseItem',
  components: {
    BusinessScopeSelector,
    OrderListDialog
  },
  props: {
    dialogMode: {
      type: String,
      default: 'add'
    },
    items: {
      type: Array,
      default: () => []
    },
    orderData: {
      type: Object,
      default: () => { }
    },
    itemsLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedItems: [],
      businessScopeSelectorVisible: false,
      currentRowIndex: -1, // 当前操作的行索引
      orderListVisible: false // 订单列表弹窗
    }
  },
  methods: {
    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
      this.$emit('selection-change', selection)
    },

    // 打开经营范围选择器
    openBusinessScopeSelector(rowIndex) {
      this.currentRowIndex = rowIndex
      this.businessScopeSelectorVisible = true
    },

    // 经营范围选择确认
    handleBusinessScopeConfirm(selectedItems) {
      if (selectedItems && selectedItems.length > 0 && this.currentRowIndex >= 0) {
        const selectedItem = selectedItems[0] // 单选模式，取第一个

        // 将选中的经营范围信息映射到当前行
        const currentRow = this.items[this.currentRowIndex]
        if (currentRow) {
          currentRow.goodNo = selectedItem.no || ''
          currentRow.goodType = selectedItem.goodType || ''
          currentRow.goodName = selectedItem.goodName || ''
          currentRow.goodModel = selectedItem.goodModel || ''
          currentRow.goodPrice = selectedItem.publicPrice || 0
          currentRow.goodCount = 1
          currentRow.goodWeight = 0
          currentRow.ratingCoefficient = 0
          currentRow.otherAdjustAmount = 0
          currentRow.goodTotalPrice = this.calcTotal(currentRow)
          currentRow.direction = 'in' // 确保进项标记

          // 触发重新计算订单金额
          this.$emit('recalc-order-amount')
        }
      }
      this.businessScopeSelectorVisible = false
    },

    // 经营范围选择器关闭
    handleBusinessScopeClose() {
      this.businessScopeSelectorVisible = false
      this.currentRowIndex = -1
    },

    // 货物单价清零
    clearAllPrices() {
      if (!this.items || this.items.length === 0) {
        this.$message.warning('没有可清零的货物明细')
        return
      }

      this.$confirm('确定要将所有货物的单价清零吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.items.forEach(item => {
          item.goodPrice = 0
          item.goodTotalPrice = 0
        })
        this.$emit('recalc-order-amount')
        this.$message.success('货物单价清零成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 新增订单明细行
    addOrderItem() {
      const newItem = {
        recycleOrderId: this.orderData.id,
        goodNo: '',
        goodType: '',
        goodName: '',
        goodModel: '',
        goodCount: 0,
        goodPrice: 0,
        goodWeight: 0,
        ratingCoefficient: 0,
        goodRatingPrice: 0,
        otherAdjustAmount: 0,
        goodTotalPrice: 0,
        goodRemark: '',
        direction: 'in' // 进项标记
      }

      this.$emit('add-item', newItem)
      this.$message.success('新增行成功')
    },

    // 删除选中的订单明细行
    deleteSelectedItems() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请先选择要删除的行')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedItems.length} 行数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete-items', this.selectedItems)
        this.selectedItems = []
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 编辑明细时联动总价
    onItemFieldChange(row) {
      row.goodTotalPrice = this.calcTotal(row)
      this.$emit('recalc-order-amount')
    },

    // 计算合计金额
    // 计算规则：货物总价 = （货物单价 * 数量 * 重量）* (1 + 评级系数) + 其他调价
    calcTotal(item) {
      const price = Number(item.goodPrice) || 0 // 货物单价
      const count = Number(item.goodCount) || 0 // 数量
      const weight = Number(item.goodWeight) || 0 // 重量
      const rating = Number(item.ratingCoefficient) || 0 // 评级系数
      const otherPrice = Number(item.otherAdjustAmount) || 0 // 其他调价

      // 货物总价 = (货物单价 * 数量 * 重量) * (1 + 评级系数) + 其他调价
      const basePrice = price * count * weight
      const totalPrice = basePrice * (1 + rating) + otherPrice

      return Number(totalPrice.toFixed(2))
    },

    // 获取进项表格合计行数据
    getPurchaseSummary(param) {
      const { columns, data } = param
      const sums = []

      columns.forEach((column, index) => {
        if (index === 0) {
          // 第一列显示"合计"文字
          sums[index] = '合计'
          return
        }

        // 根据列的 property 判断是否需要合计
        const property = column.property

        if (property === 'goodCount') {
          // 货物数量列 - 计算合计
          const values = data.map(item => Number(item.goodCount) || 0)
          const total = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = total > 0 ? total : '--'
        } else if (property === 'goodWeight') {
          // 货物重量列 - 计算合计
          const values = data.map(item => Number(item.goodWeight) || 0)
          const totalWeight = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : '--'
        } else if (property === 'goodTotalPrice') {
          // 货物总价列 - 计算合计
          const values = data.map(item => Number(item.goodTotalPrice) || 0)
          const totalPrice = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = totalPrice > 0 ? `¥${this.formatAmount(totalPrice)}` : '--'
        } else {
          // 其他列不显示合计
          sums[index] = '--'
        }
      })

      return sums
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 打开订单列表弹窗
    openOrderListDialog() {
      this.orderListVisible = true
    },

    // 处理同步订单明细
    handleSyncOrderItems(syncData) {
      const { sourceOrderNo, sourceOrderName, items } = syncData

      // 检查当前订单是否已有明细
      if (this.items && this.items.length > 0) {
        this.$confirm(
          `当前订单已存在 ${this.items.length} 条明细，是否要覆盖？`,
          '确认覆盖',
          {
            confirmButtonText: '覆盖',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.syncItemsToOrder(items, sourceOrderNo, sourceOrderName)
        }).catch(() => {
          // 用户取消
        })
      } else {
        this.syncItemsToOrder(items, sourceOrderNo, sourceOrderName)
      }
    },

    // 移除自动生成货物识别码的方法

    // 同步明细到当前订单
    syncItemsToOrder(sourceItems, sourceOrderNo, sourceOrderName) {
      try {
        // 将源订单明细转换为当前订单格式
        const newItems = sourceItems.map(item => ({
          recycleOrderId: this.orderData.id,
          goodNo: item.goodNo || '',
          goodType: item.goodType || '',
          goodName: item.goodName || '',
          goodModel: item.goodModel || '',
          goodCount: item.goodCount || 0,
          goodPrice: item.goodPrice || 0,
          goodWeight: item.goodWeight || 0,
          ratingCoefficient: item.ratingCoefficient || 0,
          goodRatingPrice: item.goodRatingPrice || 0,
          otherAdjustAmount: item.otherAdjustAmount || 0,
          goodTotalPrice: this.calcTotal(item),
          goodRemark: item.goodRemark || '',
          orderAmount: item.orderAmount || 0,
          direction: 'in' // 确保同步的明细为进项
        }))

        // 清空现有明细并添加新明细
        this.items.splice(0, this.items.length, ...newItems)

        // 触发重新计算订单金额
        this.$emit('recalc-order-amount')

        this.$message.success(`已从订单 ${sourceOrderNo} 同步 ${newItems.length} 条明细`)
      } catch (error) {
        this.$message.error('同步订单明细失败')
        console.error('同步失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-item {
  .amount-text {
    font-weight: 600;
    color: #e6a23c;
  }

  .good-no-container {
    display: flex;
    align-items: center;
  }
}
</style>
