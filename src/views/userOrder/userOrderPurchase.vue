<template>
  <div class="app-container">
    <div class="page-header">
      <h2>登记采购信息</h2>
    </div>

    <el-card class="form-card">
      <el-form :model="form" label-width="120px">
        <el-form-item label="订单编号">
          <el-input v-model="orderInfo.no" readonly disabled />
        </el-form-item>
      </el-form>

      <!-- 货物明细 -->

      <el-form>
        <el-form-item>
          <el-button type="primary" @click="addGoodItem">新增行</el-button>
          <el-button type="danger" :disabled="selectedItems.length === 0" @click="deleteSelectedItems">删除行</el-button>
          <el-button type="warning" @click="clearAllPrices">货物单价清零</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="goodItems"
        border
        fit
        style="width: 100%"
        :show-summary="true"
        :summary-method="getSummary"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="goodNo" label="货物编号" fixed="left" width="180" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.goodNo" disabled placeholder="选择货物" readonly>
              <template #append>
                <el-button icon="el-icon-search" @click="openGoodSelector(scope.$index)" />
              </template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="goodType" label="货物分类" width="160" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.goodType" disabled placeholder="无分类" />
          </template>
        </el-table-column>
        <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip>
          <template #default="scope">
            <el-input v-model="scope.row.goodName" disabled placeholder="无名称" />
          </template>
        </el-table-column>
        <el-table-column prop="goodModel" label="货物型号" width="140" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.goodModel" disabled placeholder="无型号" />
          </template>
        </el-table-column>
        <el-table-column prop="goodRemark" label="货物备注" min-width="180">
          <template #default="scope">
            <el-input v-model="scope.row.goodRemark" disabled placeholder="无备注" />
          </template>
        </el-table-column>
        <el-table-column prop="goodPrice" label="货物单价" width="210" align="center">
          <template #default="scope">
            <el-input-number
              disabled
              v-model="scope.row.goodPrice"
              :min="0"
              :precision="2"
              @change="onItemFieldChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="goodCount" label="货物数量" width="155" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.goodCount"
              style="width:130px;"
              :min="1"
              :precision="0"
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
              style="width: 130px;"
              @change="onItemFieldChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="评级系数" width="160" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.ratingCoefficient"
              :precision="4"
              controls-position="right"
              placeholder="评级系数"
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
              style="width: 130px;"
              @change="onItemFieldChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="goodTotalPrice" label="货物总价" width="160" align="center">
          <template #default="scope">
            <span class="amount-text">¥{{ formatAmount(scope.row.goodTotalPrice) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 底部按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>

    <!-- 货物选择器（使用经营范围选择器） -->
    <business-scope-selector
      v-model:visible="goodSelectorVisible"
      title="选择货物"
      :multiple="false"
      :only-show-enabled="true"
      @confirm="handleGoodSelected"
      @close="handleGoodSelectorClose"
    />
  </div>
</template>

<script>
import { getRecycleOrderByParentId, getUserOrderDetail } from '@/api/userOrder'
import { createRecycle, updateRecycle } from '@/api/recycle'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  name: 'UserOrderPurchase',
  components: {
    BusinessScopeSelector
  },
  data() {
    return {
      submitLoading: false,
      loading: false,
      orderInfo: {},
      userOrderData: {},
      recycleOrderId: null,
      isEdit: false,
      parentId: null,
      goodSelectorVisible: false,
      currentRowIndex: -1,
      selectedItems: [],
      goodItems: [],
      recycleOrderData: {}
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    async initData() {
      const id = this.$route.query.id
      if (!id) {
        this.$message.error('订单ID不存在')
        this.$router.push({ name: 'UserOrderList' })
        return
      }
      this.parentId = id
      // 先加载用户订单信息
      await this.loadUserOrder(id)
      // 再加载回收订单信息
      await this.loadRecycleOrder(id)
    },

    // 加载用户订单信息
    async loadUserOrder(id) {
      try {
        const response = await getUserOrderDetail({ id })
        if (response && response.data) {
          this.userOrderData = response.data
          this.orderInfo = {
            no: response.data.no || ''
          }
        }
      } catch (error) {
        console.error('获取用户订单信息失败:', error)
      }
    },

    // 加载回收订单信息
    async loadRecycleOrder(parentId) {
      this.loading = true
      try {
        const response = await getRecycleOrderByParentId(parentId)
        if (response && response.data) {
          this.recycleOrderData = response.data
          this.recycleOrderId = response.data.id
          this.isEdit = !!this.recycleOrderId

          // 加载货物明细（只加载进项明细，direction='in'）
          if (response.data.items && response.data.items.length > 0) {
            const inItems = response.data.items.filter(item => item.direction === 'in')
            this.goodItems = inItems.map(item => ({
              ...item,
              goodTotalPrice: this.calcTotal(item)
            }))
          } else {
            this.goodItems = []
          }
        } else {
          // 如果没有找到回收订单，初始化新订单
          this.isEdit = false
          this.recycleOrderId = null
          this.goodItems = []
          // 订单编号显示用户订单编号
          if (!this.orderInfo.no && this.userOrderData.no) {
            this.orderInfo.no = this.userOrderData.no
          }
        }
      } catch (error) {
        console.error('获取回收订单信息失败:', error)
        // 如果没有找到回收订单，初始化新订单
        this.isEdit = false
        this.recycleOrderId = null
        this.goodItems = []
        // 订单编号显示用户订单编号
        if (!this.orderInfo.no && this.userOrderData.no) {
          this.orderInfo.no = this.userOrderData.no
        }
      } finally {
        this.loading = false
      }
    },

    // 打开货物选择器
    openGoodSelector(rowIndex) {
      this.currentRowIndex = rowIndex
      this.goodSelectorVisible = true
    },

    // 货物选择确认
    handleGoodSelected(selectedItems) {
      if (selectedItems && selectedItems.length > 0 && this.currentRowIndex >= 0) {
        const selectedItem = selectedItems[0]
        const currentRow = this.goodItems[this.currentRowIndex]
        if (currentRow) {
          currentRow.goodNo = selectedItem.no || ''
          currentRow.goodType = selectedItem.goodType || ''
          currentRow.goodName = selectedItem.goodName || ''
          currentRow.goodModel = selectedItem.goodModel || ''
          currentRow.goodPrice = selectedItem.publicPrice || 0
          currentRow.goodCount = currentRow.goodCount || 1
          currentRow.goodWeight = currentRow.goodWeight || 0
          currentRow.ratingCoefficient = currentRow.ratingCoefficient || 0
          currentRow.otherAdjustAmount = currentRow.otherAdjustAmount || 0
          currentRow.goodTotalPrice = this.calcTotal(currentRow)
        }
      }
      this.goodSelectorVisible = false
    },

    // 货物选择器关闭
    handleGoodSelectorClose() {
      this.goodSelectorVisible = false
      this.currentRowIndex = -1
    },

    // 新增货物行
    addGoodItem() {
      const newItem = {
        goodNo: '',
        goodType: '',
        goodName: '',
        goodModel: '',
        goodCount: 1,
        goodPrice: 0,
        goodWeight: 0,
        ratingCoefficient: 0,
        otherAdjustAmount: 0,
        goodTotalPrice: 0,
        goodRemark: ''
      }
      this.goodItems.push(newItem)
      this.$message.success('新增行成功')
    },

    // 删除选中的行
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
        this.selectedItems.forEach(selectedItem => {
          const index = this.goodItems.findIndex(item => item === selectedItem)
          if (index > -1) {
            this.goodItems.splice(index, 1)
          }
        })
        this.selectedItems = []
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 货物单价清零
    clearAllPrices() {
      if (!this.goodItems || this.goodItems.length === 0) {
        this.$message.warning('没有可清零的货物明细')
        return
      }

      this.$confirm('确定要将所有货物的单价清零吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.goodItems.forEach(item => {
          item.goodPrice = 0
          item.goodTotalPrice = this.calcTotal(item)
        })
        this.$message.success('货物单价清零成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    // 编辑明细时联动总价
    onItemFieldChange(row) {
      row.goodTotalPrice = this.calcTotal(row)
    },

    // 计算货物总价
    // 计算规则：货物总价 = （货物单价 * 数量 * 重量）* (1 + 评级系数) + 其他调价
    calcTotal(item) {
      const price = Number(item.goodPrice) || 0
      const count = Number(item.goodCount) || 0
      const weight = Number(item.goodWeight) || 0
      const rating = Number(item.ratingCoefficient) || 0
      const otherPrice = Number(item.otherAdjustAmount) || 0

      // 货物总价 = (货物单价 * 数量 * 重量) * (1 + 评级系数) + 其他调价
      const basePrice = price * count * weight
      const totalPrice = basePrice * (1 + rating) + otherPrice

      return Number(totalPrice.toFixed(2))
    },

    // 获取表格合计行数据
    getSummary(param) {
      const { columns, data } = param
      const sums = []

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }

        const property = column.property

        if (property === 'goodCount') {
          const values = data.map(item => Number(item.goodCount) || 0)
          const total = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = total > 0 ? total : '--'
        } else if (property === 'goodWeight') {
          const values = data.map(item => Number(item.goodWeight) || 0)
          const totalWeight = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : '--'
        } else if (property === 'goodTotalPrice') {
          const values = data.map(item => Number(item.goodTotalPrice) || 0)
          const totalPrice = values.reduce((prev, curr) => prev + curr, 0)
          sums[index] = totalPrice > 0 ? `¥${this.formatAmount(totalPrice)}` : '--'
        } else {
          sums[index] = '--'
        }
      })

      return sums
    },

    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 提交表单
    async handleSubmit() {
      if (this.goodItems.length === 0) {
        this.$message.warning('请至少添加一条货物明细')
        return
      }

      // 验证必填字段
      for (let i = 0; i < this.goodItems.length; i++) {
        const item = this.goodItems[i]
        if (!item.goodNo) {
          this.$message.warning(`第 ${i + 1} 行的货物编号不能为空`)
          return
        }
        if (!item.goodCount || item.goodCount <= 0) {
          this.$message.warning(`第 ${i + 1} 行的货物数量必须大于0`)
          return
        }
      }

      this.submitLoading = true
      try {
        // 计算订单总金额和货物总金额
        const goodsTotalAmount = this.goodItems.reduce((sum, item) => {
          return sum + (Number(item.goodTotalPrice) || 0)
        }, 0)

        // 构建回收订单数据
        let orderData = {}

        if (this.isEdit && this.recycleOrderId) {
          // 编辑模式：保留原有数据，更新items和其他字段
          orderData = {
            ...this.recycleOrderData,
            id: this.recycleOrderId,
            items: this.goodItems.map(item => ({
              ...item,
              recycleOrderId: this.recycleOrderId,
              direction: 'in' // 进项标记
            })),
            goodsTotalAmount: goodsTotalAmount,
            totalAmount: goodsTotalAmount
          }
          await updateRecycle(orderData)
          this.$message.success('更新成功')
        } else {
          // 新增模式：从用户订单复制信息
          orderData = {
            parentId: this.parentId,
            type: 'purchase', // 采购订单
            status: 'processing', // 默认状态：执行中
            contractNo: this.userOrderData.contractNo || '',
            contractName: this.userOrderData.contractName || '',
            contractPartner: this.userOrderData.contractPartner || '',
            contractReferencePrice: 0,
            contractPrice: 0,
            partyA: this.userOrderData.partyA || '',
            partyB: this.userOrderData.partyB || '',
            processor: this.userOrderData.processorName || '',
            processorPhone: '',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            items: this.goodItems.map(item => ({
              ...item,
              direction: 'in' // 进项标记
            })),
            goodsTotalAmount: goodsTotalAmount,
            totalAmount: goodsTotalAmount,
            flowDirection: 'in' // 进项方向
          }
          await createRecycle(orderData)
          this.$message.success('保存成功')
        }

        this.$router.push({ name: 'UserOrderList' })
      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 取消
    handleCancel() {
      this.$router.push({ name: 'UserOrderList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .form-card {
    max-width: 1400px;
    margin: 0 auto;

    .amount-text {
      font-weight: 600;
      color: #e6a23c;
    }
  }

  .form-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
    text-align: right;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
