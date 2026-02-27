<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" @submit.prevent>
      <el-form-item label="合作方">
        <el-input v-model="searchForm.partner" placeholder="合作方" />
      </el-form-item>
      <el-form-item label="合同编号">
        <el-input v-model="searchForm.contractNo" placeholder="合同编号" />
      </el-form-item>
      <el-form-item label="订单编号">
        <el-input v-model="searchForm.orderNo" placeholder="订单编号" />
      </el-form-item>
      <el-form-item label="订单类型">
        <el-input v-model="searchForm.orderType" placeholder="订单类型" />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-input v-model="searchForm.orderStatus" placeholder="订单状态" />
      </el-form-item>
      <el-form-item label="走款方向">
        <el-input v-model="searchForm.fundFlowDirection" placeholder="走款方向" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="margin-top: 20px;">
      <el-table-column prop="partnerName" label="合作方" min-width="140" />
      <el-table-column prop="contractNo" label="合同编号" width="160" />
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="contractStatus" label="合同状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.contractStartTime, scope.row.contractEndTime)" size="medium">
            {{ getStatusText(scope.row.contractStartTime, scope.row.contractEndTime) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderType" label="订单类型" width="120">
        <template #default="scope">
          <el-tag size="medium">
            {{ getOrderTypeText(scope.row.orderType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fundFlowDirection" label="走款方向" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.fundFlowDirection === '0' ? 'danger' : 'success'">
            {{ getFundPoolDirectionName(scope.row.fundFlowDirection) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fundFlowAmount" label="走款金额" width="120">
        <template #default="scope">
          <span class="amount-text amount-flow">¥{{ formatAmount(scope.row.fundFlowAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fundPoolDirection" label="资金池方向" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.fundPoolDirection === '0' ? 'danger' : 'success'">
            {{ getFundPoolDirectionName(scope.row.fundPoolDirection) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fundPoolAmount" label="资金池走款金额" width="130">
        <template #default="scope">
          <span class="amount-text amount-pool">¥{{ formatAmount(scope.row.fundPoolAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fundDirection" label="货款方向" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.fundDirection === '0' ? 'danger' : 'success'">
            {{ getFundPoolDirectionName(scope.row.fundDirection) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fundAmount" label="货款走款金额" width="120">
        <template #default="scope">
          <span class="amount-text amount-fund">¥{{ formatAmount(scope.row.fundAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fundBank" label="货款走款银行" width="120" />
      <el-table-column prop="planPayTime" label="计划走款时间" width="160" />
      <el-table-column prop="processor" label="经办人" width="120" />
      <el-table-column prop="voucher" label="凭证" min-width="120" />
      <el-table-column prop="payFundTime" label="支付时间" width="180" />
      <el-table-column prop="status" label="走款状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === fundFlowStatus.CONFIRM ? 'success' : 'warning'" size="medium">
            {{ fundFlowStatusText[scope.row.status] || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="!hasConfirmInfo(scope.row)" size="mini" type="success" @click="handleConfirm(scope.row)">确认</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" :disabled="form.status === fundFlowStatus.CONFIRM">
        <!-- 分割线 -->
        <el-divider content-position="left">基本信息</el-divider>
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="合同编号" prop="contractNo">
                <el-input v-model="form.contractNo" disabled placeholder="请选择合同" readonly @focus="openContractSelector" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同名称" prop="contractName">
                <el-input v-model="form.contractName" disabled placeholder="请输入合同名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合作方" prop="partner">
                <el-input v-model="form.partner" disabled placeholder="请输入合作方" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同状态" prop="contractStatus">
                <el-tag :type="getStatusType(form.contractStartTime, form.contractEndTime)" size="medium">
                  {{ getStatusText(form.contractStartTime, form.contractEndTime) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="订单编号" prop="orderNo">
                <el-input v-model="form.orderNo" disabled placeholder="请输入订单编号" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="订单类型" prop="orderType">
                <el-tag size="medium">
                  {{ getOrderTypeText(form.orderType) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单总金额" prop="orderTotalAmount">
                <el-input v-model="form.orderTotalAmount" disabled placeholder="请输入订单总金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单应走金额" prop="orderShouldAmount">
                <el-input v-model="form.orderShouldAmount" disabled placeholder="请输入订单应走金额" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 分割线 -->
        <el-divider content-position="left">走款信息</el-divider>

        <!-- 金额信息 -->
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="走款方向" prop="fundFlowDirection">
                <el-select v-model="form.fundFlowDirection" placeholder="请选择">
                  <el-option v-for="option in fundDirectionOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="走款金额" prop="fundFlowAmount">
                <el-input v-model="form.fundFlowAmount" placeholder="请输入走款金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资金池方向" prop="fundPoolDirection">
                <el-select v-model="form.fundPoolDirection" placeholder="请选择">
                  <el-option v-for="option in fundPoolDirectionOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资金走款金额" prop="contractFundPoolAmount">
                <el-input v-model="form.fundPoolAmount" placeholder="请输入资金走款金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="货款方向" prop="fundDirection">
                <el-select v-model="form.fundDirection" placeholder="请选择">
                  <el-option v-for="option in fundDirectionOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="货款走款金额" prop="fundAmount">
                <el-input v-model="form.fundAmount" placeholder="请输入货款走款金额" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="货款走款银行" prop="fundBank">
                <el-input v-model="form.fundBank" placeholder="请选择货款走款银行" readonly @focus="openBankInfoSelector">
                  <template #append>
                    <el-button icon="el-icon-search" @click="openBankInfoSelector">选择</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划走款时间" prop="planPayTime">
                <el-date-picker
                  v-model="form.planPayTime"
                  type="date"
                  placeholder="选择计划走款时间"
                  style="width: 100%;"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :disabled="form.status === fundFlowStatus.CONFIRM" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 确认走款弹框 -->
    <el-dialog title="确认走款" v-model="confirmDialogVisible" width="500px">
      <el-form ref="confirmForm" :model="confirmForm" :rules="confirmRules" label-width="120px">
        <el-form-item label="经办人" prop="processor">
          <el-input v-model="confirmForm.processor" placeholder="请选择经办人" readonly @focus="openAgentSelector">
            <template #append>
              <el-button icon="el-icon-search" @click="openAgentSelector">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="凭证" prop="voucher">
          <el-input v-model="confirmForm.voucher" placeholder="请输入凭证" />
        </el-form-item>
        <el-form-item label="支付时间" prop="payFundTime">
          <el-date-picker
            v-model="confirmForm.payFundTime"
            type="datetime"
            placeholder="选择支付时间"
            style="width: 100%;"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmSubmit">录入</el-button>
        </div>
      </template>
    </el-dialog>

    <contract-selector
      v-model:visible="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleContractConfirm"
    />

    <agent-selector
      v-model:visible="agentSelectorVisible"
      title="选择经办人"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleAgentConfirm"
    />

    <bank-info-selector
      v-model:visible="bankInfoSelectorVisible"
      title="选择银行信息"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleBankInfoConfirm"
    />
  </div>

</template>

<script>
import { getFundFlowPage, addFundFlow, updateFundFlow, deleteFundFlow, submitFundFlow } from '@/api/fundFlow'
import ContractSelector from '@/components/ContractSelector'
import AgentSelector from '@/components/AgentSelector'
import BankInfoSelector from '@/components/BankInfoSelector'
import {

  ORDER_STATUS_OPTIONS,
  getOrderTypeText
} from '@/constants/orderTypes'
import { getStatusText, getStatusType } from '@/constants/constract'
import { FUND_DIRECTION } from '@/constants/fund'
import { FUND_POOL_DIRECTION, getFundPoolDirectionName } from '@/constants/pool'
import { parseTime } from '@/utils'
export default {
  name: 'FundFlow',
  components: { ContractSelector, AgentSelector, BankInfoSelector },
  data() {
    return {
      // 走款状态常量
      fundFlowStatus: {
        WAIT: 'wait',
        CONFIRM: 'confirm'
      },
      fundFlowStatusText: {
        wait: '待确认',
        confirm: '已确认'
      },
      list: [],
      listLoading: false,
      searchForm: {
        no: '',
        contractNo: '',
        partner: '',
        orderNo: '',
        orderType: '',
        orderStatus: '',
        fundFlowDirection: '',
        payFundTimeRange: []
      },
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      fundDirectionOptions: FUND_DIRECTION,
      fundPoolDirectionOptions: FUND_POOL_DIRECTION,
      getStatusText,
      getStatusType,
      getOrderTypeText,
      getFundPoolDirectionName,
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增走款',
      form: {
        id: null,
        no: '',
        contractNo: '',
        contractType: '',
        contractName: '',
        partner: '',
        orderId: '',
        orderNo: '',
        orderType: '',
        orderStatus: '',
        orderTotalAmount: '',
        orderShouldPayAmount: '',
        contractFundPoolDirection: '0',
        contractFundPoolRemainingAmount: '',
        shouldPay: null,
        thisPay: null,
        fundPoolId: '',
        fundDirection: '0',
        fundFlowDirection: '0',
        fundFlowAmount: '',
        contractFundPoolAmount: '',
        fundAmount: '',
        fundBank: '',
        planPayTime: '',
        processor: '',
        voucher: '',
        payFundTime: ''
      },
      rules: {
        contractNo: [{ required: true, message: '请选择合同编号', trigger: 'blur' }],
        fundFlowDirection: [{ required: true, message: '请选择走款方向', trigger: 'change' }],
        fundFlowAmount: [{ required: true, message: '请输入走款金额', trigger: 'blur' }],
        contractFundPoolDirection: [{ required: true, message: '请选择资金池方向', trigger: 'change' }],
        fundDirection: [{ required: true, message: '请选择货款方向', trigger: 'change' }]
      },
      contractSelectorVisible: false,
      agentSelectorVisible: false,
      bankInfoSelectorVisible: false,
      // 确认弹框相关数据
      confirmDialogVisible: false,
      confirmForm: {
        id: null,
        processor: '',
        voucher: '',
        payFundTime: ''
      },
      confirmRules: {
        processor: [{ required: true, message: '请输入经办人', trigger: 'blur' }],
        voucher: [{ required: true, message: '请输入凭证', trigger: 'blur' }],
        payFundTime: [{ required: true, message: '请选择支付时间', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {
        ...this.searchForm,
        page: this.pagination.page,
        size: this.pagination.size,
        payFundTimeStart: this.searchForm.payFundTimeRange && this.searchForm.payFundTimeRange[0] || undefined,
        payFundTimeEnd: this.searchForm.payFundTimeRange && this.searchForm.payFundTimeRange[1] || undefined
      }
      delete params.payFundTimeRange
      getFundFlowPage(params).then(res => {
        this.list = res.data.records || res.data || []
        this.pagination.total = res.data.total || 0
        this.listLoading = false
      }).catch((error) => {
        console.error('获取数据失败:', error)
        this.listLoading = false
        this.$message.error('获取数据失败')
      })
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = {
        no: '',
        contractNo: '',
        partner: '',
        orderNo: '',
        orderType: '',
        orderStatus: '',
        fundFlowDirection: '',
        payFundTimeRange: []
      }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增走款'
      this.form = {
        id: null,
        no: '',
        contractNo: '',
        contractType: '',
        contractName: '',
        partner: '',
        orderId: '',
        orderNo: '',
        orderType: '',
        orderStatus: '',
        orderTotalAmount: '',
        orderShouldPayAmount: '',
        contractFundPoolDirection: '0',
        contractFundPoolRemainingAmount: '',
        shouldPay: null,
        thisPay: null,
        fundPoolId: '',
        fundDirection: '0',
        fundFlowDirection: '0',
        fundFlowAmount: '',
        contractFundPoolAmount: '',
        fundAmount: '',
        fundBank: '',
        planPayTime: '',
        processor: '',
        voucher: '',
        payFundTime: '',
        status: this.fundFlowStatus.WAIT
      }
      this.dialogVisible = true
    },
    openContractSelector() {
      this.contractSelectorVisible = true
    },
    handleContractConfirm(selected) {
      const contract = Array.isArray(selected) ? selected[0] : selected
      if (!contract) return
      this.form.contractNo = contract.no || contract.contractNo || ''
      this.form.contractName = contract.name || contract.contractName || ''
      this.form.contractType = contract.type || ''
      this.form.partner = contract.partner || ''
      this.form.contractFundPoolDirection = contract.fundPoolDirection || '0'
      this.form.contractFundPoolRemainingAmount = contract.fundPoolRemainingAmount || ''
      this.contractSelectorVisible = false
    },
    openAgentSelector() {
      this.agentSelectorVisible = true
    },
    handleAgentConfirm(selected) {
      const agent = Array.isArray(selected) ? selected[0] : selected
      if (!agent) return
      this.confirmForm.processor = agent.name || agent.accountName || agent.username || ''
      this.agentSelectorVisible = false
    },
    openBankInfoSelector() {
      this.bankInfoSelectorVisible = true
    },
    handleBankInfoConfirm(selected) {
      const bankInfo = Array.isArray(selected) ? selected[0] : selected
      if (!bankInfo) return
      this.form.fundBank = bankInfo.bankName || ''
      this.bankInfoSelectorVisible = false
    },
    handleEdit(row) {
      this.dialogTitle = '编辑走款'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleConfirm(row) {
      this.confirmForm = {
        id: row.id,
        processor: '',
        voucher: '',
        payFundTime: ''
      }
      this.confirmDialogVisible = true
    },
    handleConfirmSubmit() {
      this.$refs.confirmForm.validate((valid) => {
        if (!valid) return

        // 这里调用确认走款的API
        const confirmData = {
          id: this.confirmForm.id,
          processor: this.confirmForm.processor,
          voucher: this.confirmForm.voucher,
          payFundTime: this.confirmForm.payFundTime,
          status: this.fundFlowStatus.CONFIRM
        }

        // 这里需要根据实际的API调整
        submitFundFlow(confirmData).then(() => {
          this.$message.success('确认走款成功')
          this.confirmDialogVisible = false
          this.fetchData()
        }).catch((error) => {
          console.error('确认走款失败:', error)
          this.$message.error('确认走款失败')
        })
      })
    },
    handleDelete(row) {
      // 已确认状态的走款不允许删除
      if (row.status === this.fundFlowStatus.CONFIRM) {
        this.$message.warning('已确认的走款不允许删除')
        return
      }

      this.$confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteFundFlow(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch((error) => {
            console.error('删除失败:', error)
            this.$message.error('删除失败')
          })
        })
        .catch(() => { })
    },
    handleSave() {
      // 已确认状态的走款不允许编辑
      if (this.form.status === this.fundFlowStatus.CONFIRM) {
        this.$message.warning('已确认的走款不允许编辑')
        return
      }

      this.$refs.form.validate((valid) => {
        if (!valid) return
        const action = this.form.id ? updateFundFlow : addFundFlow
        action(this.form).then(() => {
          this.$message.success(this.form.id ? '更新成功' : '新增成功')
          this.dialogVisible = false
          this.fetchData()
        }).catch((error) => {
          console.error(this.form.id ? '更新失败:' : '新增失败:', error)
          this.$message.error(this.form.id ? '更新失败' : '新增失败')
        })
      })
    },
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },
    // 判断是否有确认信息
    hasConfirmInfo(row) {
      return row.status === this.fundFlowStatus.CONFIRM || row.processor || row.voucher || row.payFundTime
    },
    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },
    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}

.el-divider {
  margin: 24px 0 16px 0;
}

.amount-text {
  font-weight: 600;
}

.amount-text.amount-flow {
  color: #e6a23c; /* 走款金额 - 橙色 */
}

.amount-text.amount-pool {
  color: #67c23a; /* 资金池金额 - 绿色 */
}

.amount-text.amount-fund {
  color: #409eff; /* 货款金额 - 蓝色 */
}
</style>
