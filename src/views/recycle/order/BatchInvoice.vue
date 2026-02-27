<template>
  <el-dialog title="批量开票" v-model="dialogVisible" width="90%" :close-on-click-modal="false" top="5vh">
    <el-table v-loading="loading" :data="invoiceList" border fit style="width: 100%">
      <el-table-column prop="orderNo" label="订单编号" width="150" align="center" />
      <el-table-column prop="orderType" label="订单类型" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getOrderTypeTagType(scope.row.orderType)">
            {{ getOrderTypeText(scope.row.orderType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.orderStatus)">
            {{ getOrderStatusText(scope.row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="partner" label="合作方" width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="orderTotalAmount" label="订单总金额" width="140" align="center">
        <template #default="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderTotalAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderShouldInvoice" label="订单应开发票" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.orderShouldInvoice"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="orderActualInvoice" label="订单已开发票" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.orderActualInvoice"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="plannedInvoiceTime" label="本次计划开票时间" width="180" align="center">
        <template #default="scope">
          <el-date-picker
            v-model="scope.row.plannedInvoiceTime"
            type="datetime"
            placeholder="选择开票时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="plannedInvoiceAmount" label="本次计划开票金额" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.plannedInvoiceAmount"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="invoiceBank" label="开票银行" width="200" align="center">
        <template #default="scope">
          <el-select
            v-model="scope.row.invoiceBank"
            placeholder="选择银行账号"
            style="width: 100%;"
            filterable
            @change="onBankChange(scope.row)"
          >
            <el-option
              v-for="bank in scope.row.partnerBankList"
              :key="bank.cardNumber"
              :label="`${bank.cardNumber}`"
              :value="bank.id"
            />
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="invoiceLoading" @click="handleInvoice">开票</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  ORDER_TYPE_TAG_TYPE,
  getOrderTypeText,
  getOrderStatusTagType,
  getOrderStatusText
} from '@/constants/orderTypes'
import { batchCreateInvoice } from '@/api/recycle'
import { getBankInfoByUserId } from '@/api/bankInfo'
import { useUserStore } from '@/stores/user'

export default {
  name: 'BatchInvoice',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedOrders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      invoiceLoading: false,
      invoiceList: [],
      isInitialized: false // 添加初始化标志
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
      if (newVal && !this.isInitialized) {
        this.initData()
      } else if (!newVal) {
        // 弹窗关闭时重置初始化标志
        this.isInitialized = false
      }
    }
  },
  methods: {
    // 将常量/函数暴露给模板使用
    getOrderTypeTagType: ORDER_TYPE_TAG_TYPE,
    getOrderTypeText,
    getOrderStatusTagType,
    getOrderStatusText,
    // 初始化数据
    async initData() {
      console.log('initData 被调用，selectedOrders:', this.selectedOrders)
      if (!Array.isArray(this.selectedOrders) || this.selectedOrders.length === 0) {
        this.invoiceList = []
        return
      }

      this.loading = true
      try {
        // 将选中的订单转换为开票列表，并异步获取银行账号
        const invoiceList = []
        for (const order of this.selectedOrders) {
          const partnerName = order.partner || order.partnerName || order.contractPartnerName || order.contractPartner || order.partyAName || order.partyBName || ''
          const totalAmount = Number(order.totalAmount || order.orderAmount || order.contractPrice || 0)
          const shouldInvoice = Number(order.shouldInvoice || order.orderShouldInvoice || 0)
          const actualInvoice = Number(order.actualInvoice || order.orderActualInvoice || 0)
          const remaining = Math.max(0, Number((shouldInvoice - actualInvoice).toFixed(2)))

          // 获取合作方银行账号列表
          const partnerBankList = await this.getPartnerBankList(order.contractPartner)
          // 找到默认的银行卡
          const defaultBank = partnerBankList.find(bank => bank.isDefault)

          // 检查是否已存在该订单的数据，如果存在则保留用户输入的数据
          const existingRow = this.invoiceList.find(item => item.orderId === order.id)

          invoiceList.push({
            orderId: order.id,
            orderNo: order.no,
            orderType: order.type,
            orderStatus: order.status,
            partner: partnerName,
            orderTotalAmount: totalAmount,
            orderShouldInvoice: shouldInvoice, // 应开发票金额
            orderActualInvoice: actualInvoice, // 已开发票金额
            plannedInvoiceTime: existingRow?.plannedInvoiceTime || '', // 保留用户输入的时间
            plannedInvoiceAmount: existingRow?.plannedInvoiceAmount || remaining, // 保留用户输入的金额，否则使用默认值
            invoiceBank: existingRow?.invoiceBank || defaultBank?.id || '', // 保留用户选择的银行
            partnerBankList: partnerBankList || [] // 合作方银行账号列表
          })
        }
        this.invoiceList = invoiceList
        this.isInitialized = true // 标记为已初始化
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message.error('获取银行信息失败，请重试')
      } finally {
        this.loading = false
      }
    },

    // 获取合作方银行账号列表
    async getPartnerBankList(accountId) {
      try {
        if (!accountId) {
          return []
        }
        const res = await getBankInfoByUserId(accountId)

        if (res.data && Array.isArray(res.data)) {
          return res.data
        }
        return []
      } catch (error) {
        console.error('获取合作方银行账号失败:', error)
        return []
      }
    },

    // 银行选择变化处理
    onBankChange(row) {
      console.log('银行选择变化:', row.invoiceBank)
      // 可以在这里添加银行选择后的逻辑处理
    },

    // 根据ID获取银行信息
    getBankInfoById(bankId, partnerBankList) {
      if (!bankId) return null

      // 检查合作方银行账号列表
      if (partnerBankList && Array.isArray(partnerBankList)) {
        return partnerBankList.find(bank => bank.id === bankId) || null
      }

      return null
    },

    // 根据银行ID获取银行名称
    getBankNameById(bankId, partnerBankList) {
      const bankInfo = this.getBankInfoById(bankId, partnerBankList)
      return bankInfo ? bankInfo.bankName || bankInfo.cardNumber : '未知银行'
    },

    // 生成发票编号
    generateInvoiceNo() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      return `INV${year}${month}${day}${hours}${minutes}${seconds}`
    },

    // 格式化金额
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 计算剩余可开金额
    getRemaining(row) {
      const should = Number(row.orderShouldInvoice || 0)
      const actual = Number(row.orderActualInvoice || 0)
      return Math.max(0, Number((should - actual).toFixed(2)))
    },

    // 开票
    handleInvoice() {
      // 验证必填字段
      const invalidRows = []

      this.invoiceList.forEach((row, index) => {
        const missingFields = []

        if (!row.plannedInvoiceTime || row.plannedInvoiceTime.trim() === '') {
          missingFields.push('计划开票时间')
        }

        if (!row.plannedInvoiceAmount || row.plannedInvoiceAmount <= 0) {
          missingFields.push('计划开票金额')
        }

        if (!row.invoiceBank || row.invoiceBank === '') {
          missingFields.push('开票银行')
        }

        if (missingFields.length > 0) {
          invalidRows.push({
            orderNo: row.orderNo,
            missingFields: missingFields
          })
        }
      })

      if (invalidRows.length > 0) {
        const errorMessages = invalidRows.map(row => {
          return `订单 ${row.orderNo}：缺少 ${row.missingFields.join('、')}`
        })

        this.$message.error({
          message: errorMessages.join('；'),
          duration: 5000,
          showClose: true
        })
        return
      }

      // 注释掉开票金额限制验证，允许开票金额超过剩余可开金额
      // const invalidAmountRows = this.invoiceList.filter(row => {
      //   return Number(row.plannedInvoiceAmount || 0) > this.getRemaining(row)
      // })

      // if (invalidAmountRows.length > 0) {
      //   const errorMessages = invalidAmountRows.map(row => {
      //     const remaining = this.getRemaining(row)
      //     return `订单 ${row.orderNo}：计划开票金额 ${row.plannedInvoiceAmount} 超过剩余可开金额 ${remaining}`
      //   })

      //   this.$message.error({
      //     message: errorMessages.join('；'),
      //     duration: 5000,
      //     showClose: true
      //   })
      //   return
      // }

      this.$confirm('确定要批量开票吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.invoiceLoading = true

        // 准备开票数据
        // 检查是否所有订单都选择了相同的银行
        const firstBankId = this.invoiceList[0]?.invoiceBank
        const allSameBank = this.invoiceList.every(row => row.invoiceBank === firstBankId)

        if (!allSameBank) {
          this.$message.error('所有订单必须选择相同的开票银行')
          return
        }

        const invoiceData = {
          invoice: {
            invoiceNo: this.generateInvoiceNo(), // 生成发票编号
            invoiceType: '进项', // 固定为进项发票
            invoiceBank: this.getBankNameById(firstBankId, this.invoiceList[0].partnerBankList), // 银行名称
            processor: (useUserStore().name || '系统管理员') // 获取当前用户名称
          },
          details: this.invoiceList.map(row => ({
            orderNo: row.orderNo,
            orderTotalAmount: row.orderTotalAmount,
            orderActualInvoice: row.plannedInvoiceAmount, // 本次计划开票金额作为实际开票金额
            orderShouldInvoice: row.orderShouldInvoice
          }))
        }

        // 调用批量开票接口
        batchCreateInvoice(invoiceData).then(response => {
          this.invoiceLoading = false
          if (response.code === 200) {
            this.$message.success('批量开票成功')
            this.$emit('success', this.invoiceList)
            this.handleCancel()
          } else {
            this.$message.error(response.message || '批量开票失败')
          }
        }).catch(error => {
          this.invoiceLoading = false
          console.error('批量开票失败:', error)
          this.$message.error('批量开票失败，请重试')
        })
      }).catch(() => {
        // 用户取消
      })
    },

    // 取消
    handleCancel() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.amount-text {
  font-weight: 600;
  color: #e6a23c;
}

.dialog-footer {
  text-align: right;
}

// 银行账号选择器样式
:deep(.el-select-dropdown__item) {
  &.is-selected {
    color: #409EFF;
    font-weight: 600;
  }
}

:deep(.el-select) {
  .el-input__inner {
    font-size: 13px;
  }
}
</style>
