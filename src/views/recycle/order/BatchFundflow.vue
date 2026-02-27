<template>
  <el-dialog title="批量走款" v-model="dialogVisible" width="90%" :close-on-click-modal="false" top="5vh">
    <el-table v-loading="loading" :data="fundflowList" border fit style="width: 100%">
      <el-table-column prop="orderNo" label="订单编号" width="150" align="center" />
      <el-table-column prop="orderType" label="订单类型" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.orderType)">
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
      <el-table-column prop="partnerName" label="合作方" width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="contractFundPoolBalance" label="合同资金池剩余金额" width="150" align="center">
        <template #default="scope">
          <span v-if="typeof scope.row.contractFundPoolBalance === 'string'" class="error-text">
            {{ scope.row.contractFundPoolBalance }}
          </span>
          <span v-else-if="scope.row.contractFundPoolBalance === 0" class="warning-text">
            余额不足
          </span>
          <span v-else class="amount-text">¥{{ formatAmount(scope.row.contractFundPoolBalance) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderTotalAmount" label="订单总金额" width="140" align="center">
        <template #default="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderTotalAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderActualAmount" label="订单实走金额" width="140" align="center">
        <template #default="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderActualAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderShouldAmount" label="订单应走金额" width="140" align="center">
        <template #default="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderShouldAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="planPayTime" label="本次计划走款时间" width="180" align="center">
        <template #default="scope">
          <el-date-picker
            v-model="scope.row.planPayTime"
            type="datetime"
            placeholder="选择走款时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="fundFlowAmount" label="本次计划走款金额" width="160" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.fundFlowAmount"
            disabled
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="fundAmount" label="计划货款走款" width="140" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.fundAmount"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
            @change="onLoanAmountChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="fundPoolAmount" label="计划资金池走款" width="150" align="center">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.fundPoolAmount"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
            :disabled="!scope.row.hasFundPool"
            :placeholder="scope.row.hasFundPool ? '请输入金额' : '无资金池'"
            @change="onCapitalPoolAmountChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="fundBank" label="走款银行" width="200" align="center">
        <template #default="scope">
          <el-select
            v-model="scope.row.fundBank"
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
        <el-button type="primary" :loading="saveLoading" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  getOrderTypeText,
  getOrderStatusTagType,
  getOrderStatusText
} from '@/constants/orderTypes'
import { batchAddFundFlow } from '@/api/fundFlow'
import { getCapitalPoolByContractNo } from '@/api/capitalPool'
import { getBankInfoByUserId } from '@/api/bankInfo'
import { getContractByNo } from '@/api/recycleContract'
export default {
  name: 'BatchFundflow',
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
      saveLoading: false,
      fundflowList: [],
      getOrderTypeText,
      getOrderStatusTagType,
      getOrderStatusText
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
        this.initData()
      }
    },
    selectedOrders: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.initData()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      if (!this.selectedOrders || this.selectedOrders.length === 0) {
        this.$message.error('请选择订单')
        this.fundflowList = []
        return
      }

      this.loading = true
      try {
        // 将选中的订单转换为走款列表，并异步获取资金池余额和银行账号
        const fundflowList = []
        for (const order of this.selectedOrders) {
          const [contractFundPoolBalance, mainBankInfo, partnerBankList] = await Promise.all([
            this.getCapitalPoolRemaining(order.contractNo),
            this.getMainBankInfo(order.contractNo),
            this.getPartnerBankList(order.contractPartner)
          ])
          // 找到默认的银行卡
          const defaultBank = partnerBankList.find(bank => bank.isDefault)

          // 判断合同是否有资金池
          const hasFundPool = typeof contractFundPoolBalance === 'number'

          fundflowList.push({
            ...order,
            orderId: order.id,
            orderNo: order.no,
            orderType: order.type,
            orderStatus: order.status,
            partner: order.contractPartner,
            partnerName: order.contractPartnerName,
            contractFundPoolBalance: contractFundPoolBalance,
            orderTotalAmount: order.totalAmount || 0,
            orderActualAmount: order.actualAmount || 0, // 已走款金额
            orderShouldAmount: (order.totalAmount || 0) - (order.actualAmount || 0), // 应走款金额
            planPayTime: '', // 计划走款时间
            fundFlowAmount: 0, // 走款金额
            fundAmount: 0, // 货款走款金额
            fundPoolAmount: 0, // 资金池走款金额
            fundBank: defaultBank?.id || '', // 使用银行ID而不是卡号
            mainBankInfo: mainBankInfo, // 主银行账号信息
            partnerBankList: partnerBankList || [], // 合作方银行账号列表
            hasFundPool: hasFundPool // 标记是否有资金池
          })
        }
        this.fundflowList = fundflowList
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message.error('获取资金池信息失败，请重试')
      } finally {
        this.loading = false
      }
    },

    // 获取资金池剩余金额
    async getCapitalPoolRemaining(contractNo) {
      try {
        const res = await getCapitalPoolByContractNo(contractNo)
        console.log('资金池接口返回:', res)

        if (!res.data || res.data === null) {
          return '合同尚未创建资金池'
        }

        // 确保返回的是数字类型
        const balance = Number(res.data.balance) || 0
        return balance
      } catch (error) {
        console.error('获取资金池余额失败:', error)
        return '获取失败'
      }
    },

    // 获取合同主银行账号
    async getMainBankInfo(contractNo) {
      try {
        const res = await getContractByNo(contractNo)
        if (res.data == null) {
          return null
        }
        return res.data.mainBankCard
      } catch (error) {
        console.error('获取主银行账号失败:', error)
        return null
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

    // 货款金额变化处理
    onLoanAmountChange(row) {
      // 计划走款 = 计划货款走款 + 计划资金池走款
      row.fundFlowAmount = (row.fundAmount || 0) + (row.fundPoolAmount || 0)
    },

    // 资金池金额变化处理
    onCapitalPoolAmountChange(row) {
      // 计划走款 = 计划货款走款 + 计划资金池走款
      row.fundFlowAmount = (row.fundAmount || 0) + (row.fundPoolAmount || 0)
    },

    // 银行选择变化处理
    onBankChange(row) {
      console.log('银行选择变化:', row.fundBank)
      // 可以在这里添加银行选择后的逻辑处理
    },

    // 根据ID获取银行信息
    getBankInfoById(bankId, mainBankInfo, partnerBankList) {
      if (!bankId) return null

      // 先检查是否是主银行账号
      if (mainBankInfo && mainBankInfo.id === bankId) {
        return mainBankInfo
      }

      // 再检查合作方银行账号列表
      if (partnerBankList && Array.isArray(partnerBankList)) {
        return partnerBankList.find(bank => bank.id === bankId) || null
      }

      return null
    },

    // 格式化金额
    formatAmount(amount) {
      // 如果是字符串类型（如"合同尚未创建资金池"），直接返回
      if (typeof amount === 'string') {
        return amount
      }
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 保存
    handleSave() {
      // 验证必填字段
      const invalidRows = this.fundflowList.filter(row => {
        return !row.planPayTime ||
               !row.fundFlowAmount ||
               row.fundFlowAmount <= 0 ||
               !row.fundBank
      })

      if (invalidRows.length > 0) {
        this.$message.error('请完善所有必填信息')
        return
      }

      // 移除资金池验证逻辑，现在没有绑定资金池也能进行走款

      // 验证金额逻辑
      const invalidAmountRows = this.fundflowList.filter(row => {
        const fundFlowAmount = row.fundFlowAmount || 0
        const fundAmount = row.fundAmount || 0
        const fundPoolAmount = row.fundPoolAmount || 0

        return fundFlowAmount !== (fundAmount + fundPoolAmount)
      })

      if (invalidAmountRows.length > 0) {
        this.$message.error('走款金额必须等于货款走款金额加资金池走款金额')
        return
      }

      // 验证资金池走款金额不超过可用余额
      // const invalidFundPoolRows = this.fundflowList.filter(row => {
      //   const availableBalance = Number(row.contractFundPoolBalance) || 0
      //   return row.fundPoolAmount > availableBalance
      // })

      // if (invalidFundPoolRows.length > 0) {
      //   this.$message.error('资金池走款金额不能超过可用余额')
      //   return
      // }

      this.$confirm('确定要保存批量走款信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.saveLoading = true

        try {
          // 准备批量走款数据
          const batchData = this.fundflowList.map(i => {
            return {
              contractId: i.contractId,
              orderId: i.orderId,
              orderTotalAmount: i.orderTotalAmount,
              orderShouldAmount: i.orderShouldAmount,
              orderActualAmount: i.orderActualAmount,
              fundFlowDirection: i.fundFlowDirection,
              fundFlowAmount: i.fundFlowAmount,
              // 货款方向
              fundDirection: i.fundDirection,
              fundAmount: i.fundAmount,
              fundBank: i.fundBank,
              fundBankInfo: this.getBankInfoById(i.fundBank, i.mainBankInfo, i.partnerBankList),
              fundPoolAmount: i.fundPoolAmount,
              partner: i.partner,
              partnerName: i.partnerName,
              planPayTime: i.planPayTime
            }
          })

          // 调用批量新增走款API
          await batchAddFundFlow(batchData)
          this.$emit('success', this.fundflowList)
          this.handleCancel()
        } catch (error) {
          console.error('批量走款保存失败:', error)
          this.$message.error('批量走款保存失败，请重试')
        } finally {
          this.saveLoading = false
        }
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

.error-text {
  font-weight: 500;
  color: #f56c6c;
  font-size: 12px;
}

.warning-text {
  font-weight: 500;
  color: #e6a23c;
  font-size: 12px;
}

.no-fund-pool-tip {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 2px;
  text-align: center;
}

.info-tips {
  margin-bottom: 20px;
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
