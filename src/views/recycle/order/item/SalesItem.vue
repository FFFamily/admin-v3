<template>
  <div class="sales-item">

    <!-- 销项订单明细 -->
    <el-divider content-position="left">销项订单明细</el-divider>
    <el-form>
      <el-form-item>
        <!-- 移除关联源识别码按钮，不再需要 -->
        <!-- <el-button type="success" @click="syncFromPurchaseItems">从进项同步</el-button> -->
        <el-button type="primary" @click="addSalesItem">新增行</el-button>
        <el-button type="danger" @click="clearSalesItems">清空</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="salesItemsLoading"
      :data="salesItems"
      border
      fit
      style="width: 100%; margin-bottom: 20px;"
      :show-summary="true"
      :summary-method="getSalesSummary"
      @selection-change="handleSalesSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="goodNo" label="货物编号" width="180" align="center">
        <template #default="scope">
          <div class="good-no-container">
            <el-input v-model="scope.row.goodNo" placeholder="请输入货物编号" :disabled="!scope.row.goodNo" readonly>
              <template #append>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-search"
                  @click="openBusinessScopeSelector(scope.$index)"
                >
                  搜索
                </el-button>
              </template>
            </el-input>

          </div>
        </template>
      </el-table-column>
      <el-table-column prop="goodType" label="货物分类" width="120" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.goodType" placeholder="请输入货物分类" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          <el-input v-model="scope.row.goodName" placeholder="请输入货物名称" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodModel" label="规格型号" width="140" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.goodModel" placeholder="请输入规格型号" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodRemark" label="货物备注" width="120" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.goodRemark" placeholder="请输入货物备注" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodCount" label="货物数量" width="150" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.goodCount"
            :min="1"
            :precision="0"
            controls-position="right"
            :disabled="!scope.row.goodNo"
            style="width: 110px;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="goodWeight" label="货物重量" width="150" align="center">
        <template #default="scope">
          <el-input-number v-model="scope.row.goodWeight" style="width: 110px;" controls-position="right" placeholder="请输入货物重量" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <!-- 移除源识别码和销项识别码列，使用订单主识别码 -->
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
  </div>
</template>

<script>
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  name: 'SalesItem',
  components: {
    BusinessScopeSelector
  },
  props: {
    dialogMode: {
      type: String,
      default: 'add'
    },
    salesItems: {
      type: Array,
      default: () => []
    },
    salesItemsLoading: {
      type: Boolean,
      default: false
    },
    purchaseItems: {
      type: Array,
      default: () => []
    },
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedSalesItems: [],
      businessScopeSelectorVisible: false,
      currentRowIndex: -1 // 当前操作的行索引
    }
  },
  methods: {
    // 新增行
    addSalesItem() {
      this.salesItems.push({
        goodNo: '',
        goodType: '',
        goodName: '',
        goodModel: '',
        goodCount: 0,
        goodWeight: '',
        goodRemark: '',
        direction: 'out' // 销项标记
      })
    },

    // 移除源识别码选择方法，不再需要
    // 处理销项表格选择变化
    handleSalesSelectionChange(selection) {
      this.selectedSalesItems = selection
      this.$emit('sales-selection-change', selection)
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
        const currentRow = this.salesItems[this.currentRowIndex]
        if (currentRow) {
          currentRow.goodNo = selectedItem.no || ''
          currentRow.goodType = selectedItem.goodType || ''
          currentRow.goodName = selectedItem.goodName || ''
          currentRow.goodModel = selectedItem.goodModel || ''
          currentRow.goodCount = 1
          currentRow.direction = 'out' // 确保销项标记
        }
      }
      this.businessScopeSelectorVisible = false
    },

    // 经营范围选择器关闭
    handleBusinessScopeClose() {
      this.businessScopeSelectorVisible = false
      this.currentRowIndex = -1
    },

    // 移除关联源识别码方法，不再需要

    // 清空销项明细
    clearSalesItems() {
      if (!this.salesItems || this.salesItems.length === 0) {
        this.$message.warning('没有可清空的销项明细')
        return
      }

      this.$confirm('确定要清空所有销项明细吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('clear-sales-items')
        this.selectedSalesItems = []
        this.$message.success('销项明细清空成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 从进项明细同步数据到销项明细
    syncFromPurchaseItems() {
      if (!this.purchaseItems || this.purchaseItems.length === 0) {
        this.$message.warning('没有可同步的进项明细')
        return
      }

      this.$confirm('确定要从进项明细同步数据到销项明细吗？这将覆盖现有的销项数据！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const newSalesItems = this.purchaseItems.map(item => ({
          goodNo: item.goodNo,
          goodType: item.goodType,
          goodName: item.goodName,
          goodModel: item.goodModel,
          goodCount: item.goodCount,
          goodWeight: item.goodWeight,
          goodRemark: item.goodRemark,
          direction: 'out' // 同步到销项时标记为销项
        }))
        this.$emit('sync-from-purchase', newSalesItems)
        this.$message.success('从进项明细同步成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 解析重量字符串为数字
    parseWeight(weightStr) {
      if (!weightStr) return 0
      // 提取数字部分
      const match = weightStr.toString().match(/(\d+(?:\.\d+)?)/)
      return match ? Number(match[1]) : 0
    },

    // 获取销项表格合计行数据
    getSalesSummary(param) {
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
          const values = data.map(item => this.parseWeight(item.goodWeight))
          const totalWeight = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : '--'
        } else {
          // 其他列不显示合计
          sums[index] = '--'
        }
      })

      return sums
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-item {
  // 可以添加销项特有的样式

  .good-no-container {
    display: flex;
    align-items: center;
  }

  .text-muted {
    color: #909399;
    font-size: 12px;
  }
}
</style>
