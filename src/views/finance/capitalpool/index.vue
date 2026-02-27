<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" @submit.prevent>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增资金池</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="margin-top: 20px;">
      <el-table-column prop="no" label="资金池编号" width="180" />
      <el-table-column prop="contractNo" label="合同编号" width="220" />
      <el-table-column prop="contractName" label="合同名称" width="140" />
      <el-table-column prop="contractPartnerName" label="合作方" width="140" />
      <el-table-column prop="contractName" label="合同类型" width="140" />
      <el-table-column prop="fundPoolDirection" label="资金池方向" width="140">
        <template #default="scope">
          {{ getFundPoolDirectionName(scope.row.fundPoolDirection) }}
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="当前余额" width="140">
        <template #default="scope">¥{{ formatAmount(scope.row.balance) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="mini" @click="handleViewDetail(scope.row)">明细</el-button>
          <el-button size="mini" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 新增/编辑资金池 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px">
      <el-form ref="form" :model="form" :rules="dynamicRules" label-width="140px">
        <!-- 基本信息 -->
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="编号" prop="no">
                <el-input v-model="form.no" placeholder="请输入编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同编号" prop="contractNo">
                <el-input v-model="form.contractNo" placeholder="请选择合同" :readonly="!!form.id" @focus="!form.id && openContractSelector()">
                  <template #append>
                    <el-button v-if="!form.id" icon="el-icon-search" @click="openContractSelector">选择</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同名称" prop="contractName">
                <el-input v-model="form.contractName" placeholder="请输入合同名称" :readonly="!!form.id" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合作方" prop="contractPartnerName">
                <el-input v-model="form.contractPartnerName" placeholder="请输入合作方" :readonly="!!form.id" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 分割线 -->

        <!-- 资金池信息 -->
        <div class="form-section">
          <el-row :gutter="1">
            <el-col :span="12">
              <el-form-item label="资金池方向" prop="fundPoolDirection">
                <el-select v-model="form.fundPoolDirection" placeholder="请选择资金池方向" style="width: 100%;" :disabled="!!form.id">
                  <el-option v-for="item in FUND_POOL_DIRECTION" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="初始金额" prop="initialAmount">
                <el-input-number
                  v-model="form.initialAmount"
                  :min="0"
                  :precision="2"
                  style="width: 100%;"
                  placeholder="请输入初始金额"
                  :disabled="!!form.id"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="初始余额凭证" prop="initialBalanceVoucher">
                <el-input
                  v-model="form.initialBalanceVoucher"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入初始余额凭证"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 合同选择器 -->
    <contract-selector
      v-model:visible="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleContractConfirm"
    />

    <!-- 资金池明细 -->
    <el-dialog title="资金池明细" v-model="detailVisible" width="1100px" class="capital-pool-detail-dialog">
      <div class="detail-container">
        <!-- 资金池基本信息 -->
        <div class="pool-info-section">
          <el-card shadow="never" class="info-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">资金池信息</span>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="info-item">
                  <label>资金池编号：</label>
                  <span>{{ (currentPool && currentPool.no) || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>合同编号：</label>
                  <span>{{ (currentPool && currentPool.contractNo) || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>当前余额：</label>
                  <span class="balance-amount">¥{{ formatAmount((currentPool && currentPool.balance) || 0) }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>资金池方向：</label>
                  <el-tag :type="(currentPool && currentPool.fundPoolDirection === 'IN') ? 'success' : 'warning'">
                    {{ getFundPoolDirectionName(currentPool && currentPool.fundPoolDirection) }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <!-- 余额变更统计 -->
        <div class="balance-summary-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="never" class="summary-card">
                <div class="summary-item">
                  <div class="summary-label">总流入</div>
                  <div class="summary-value income">¥{{ formatAmount(balanceSummary.totalIncome) }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="never" class="summary-card">
                <div class="summary-item">
                  <div class="summary-label">总流出</div>
                  <div class="summary-value expense">¥{{ formatAmount(balanceSummary.totalExpense) }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="never" class="summary-card">
                <div class="summary-item">
                  <div class="summary-label">净变动</div>
                  <div class="summary-value" :class="balanceSummary.netChange >= 0 ? 'income' : 'expense'">
                    {{ balanceSummary.netChange >= 0 ? '+' : '' }}¥{{ formatAmount(balanceSummary.netChange) }}
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 详细记录表格 -->
        <div class="detail-table-section">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">详细记录</span>
                <span class="record-count">共 {{ details.length }} 条记录</span>
              </div>
            </template>
            <el-table v-loading="detailsLoading" :data="details" border fit size="small">
              <el-table-column prop="createTime" label="变更时间" width="160">
                <template #default="scope">
                  {{ formatTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="direction" label="资金方向" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.direction === '0' ? 'success' : 'danger'" size="small">
                    {{ scope.row.direction === '0' ? '进' : '出' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="变更金额" width="120" align="right">
                <template #default="scope">
                  <span :class="scope.row.direction === '0' ? 'income-text' : 'expense-text'">
                    {{ formatAmount(scope.row.amount) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="beforeBalance" label="变更前余额" width="140" align="right">
                <template #default="scope">¥{{ formatAmount(scope.row.beforeBalance) }}</template>
              </el-table-column>
              <el-table-column prop="afterBalance" label="变更后余额" width="140" align="right">
                <template #default="scope">¥{{ formatAmount(scope.row.afterBalance) }}</template>
              </el-table-column>
              <el-table-column prop="orderId" label="关联订单" width="120">
                <template #default="scope">
                  {{ scope.row.orderId || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="150">
                <template #default="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCapitalPoolPage, createCapitalPool, updateCapitalPool, deleteCapitalPool, getCapitalPoolDetails } from '@/api/capitalPool'
import ContractSelector from '@/components/ContractSelector'
import { FUND_POOL_DIRECTION, getFundPoolDirectionName } from '@/constants/pool'
export default {
  name: 'CapitalPool',
  components: { ContractSelector },
  data() {
    return {
      getFundPoolDirectionName,
      FUND_POOL_DIRECTION,
      list: [],
      listLoading: false,
      searchForm: {
        no: '',
        contractId: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增资金池',
      form: {
        id: null,
        no: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        fundPoolDirection: '',
        initialAmount: 0,
        initialBalanceVoucher: ''
      },
      rules: {
        no: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
        contractName: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
        contractPartnerName: [{ required: true, message: '请输入合作方', trigger: 'blur' }],
        fundPoolDirection: [{ required: true, message: '请选择资金池方向', trigger: 'change' }],
        initialAmount: [{ required: true, message: '请输入初始金额', trigger: 'blur' }],
        initialBalanceVoucher: [{ required: true, message: '请输入初始余额凭证', trigger: 'blur' }]
      },
      detailVisible: false,
      detailsLoading: false,
      details: [],
      currentPool: null,
      contractSelectorVisible: false,
      balanceSummary: {
        totalIncome: 0,
        totalExpense: 0,
        netChange: 0
      }
    }
  },
  computed: {
    // 动态验证规则：编辑模式下只验证可编辑的字段
    dynamicRules() {
      if (this.form.id) {
        // 编辑模式：只验证编号和初始余额凭证
        return {
          no: [{ required: true, message: '请输入编号', trigger: 'blur' }],
          initialBalanceVoucher: [{ required: true, message: '请输入初始余额凭证', trigger: 'blur' }]
        }
      } else {
        // 新增模式：验证所有字段
        return {
          no: [{ required: true, message: '请输入编号', trigger: 'blur' }],
          contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
          contractName: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
          contractPartnerName: [{ required: true, message: '请输入合作方', trigger: 'blur' }],
          fundPoolDirection: [{ required: true, message: '请选择资金池方向', trigger: 'change' }],
          initialAmount: [{ required: true, message: '请输入初始金额', trigger: 'blur' }],
          initialBalanceVoucher: [{ required: true, message: '请输入初始余额凭证', trigger: 'blur' }]
        }
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    calculateBalanceSummary(details) {
      let totalIncome = 0
      let totalExpense = 0

      details.forEach(detail => {
        const amount = Number(detail.amount) || 0
        if (detail.direction === '0') {
          totalIncome += amount
        } else {
          totalExpense += amount
        }
      })

      this.balanceSummary = {
        totalIncome,
        totalExpense,
        netChange: totalIncome + totalExpense
      }
    },
    fetchData() {
      this.listLoading = true
      const params = {
        page: this.pagination.page,
        size: this.pagination.size,
        ...this.searchForm
      }
      getCapitalPoolPage(params).then(res => {
        this.list = res.data.records || res.data || []
        this.pagination.total = res.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { no: '', contractId: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增资金池'
      this.form = {
        id: null,
        no: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        fundPoolDirection: '',
        initialAmount: 0,
        initialBalanceVoucher: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑资金池'
      this.form = { ...row }
      this.dialogVisible = true
    },
    openContractSelector() {
      this.contractSelectorVisible = true
    },
    handleContractConfirm(selected) {
      const contract = Array.isArray(selected) ? selected[0] : selected
      if (!contract) return
      this.form.contractId = contract.id
      this.form.contractNo = contract.no
      this.form.contractName = contract.name
      this.form.contractPartner = contract.partner
      this.form.contractPartnerName = contract.partnerName
      this.contractSelectorVisible = false
    },
    handleDelete(row) {
      this.$confirm('确定要删除该资金池吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteCapitalPool(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return

        let submitData
        if (this.form.id) {
          // 编辑模式：只提交可编辑的字段
          submitData = {
            id: this.form.id,
            no: this.form.no,
            initialBalanceVoucher: this.form.initialBalanceVoucher
          }
        } else {
          // 新增模式：提交所有字段
          submitData = { ...this.form }
        }

        const action = this.form.id ? updateCapitalPool : createCapitalPool
        action(submitData).then(() => {
          this.$message.success(this.form.id ? '更新成功' : '新增成功')
          this.dialogVisible = false
          this.fetchData()
        })
      })
    },
    handleViewDetail(row) {
      this.currentPool = row
      this.detailVisible = true
      this.detailsLoading = true
      getCapitalPoolDetails(row.id || row.capitalPoolId).then(res => {
        this.details = res.data.records || res.data || []
        // 按时间倒序排列，最新的在前面
        this.details.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        // 计算余额汇总
        this.calculateBalanceSummary(this.details)
        this.detailsLoading = false
      }).catch(() => { this.detailsLoading = false })
    },
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.el-divider {
  margin: 24px 0 16px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  background-color: #f5f7fa;
  padding: 0 16px;
}

/* 资金池明细弹框样式 */

.capital-pool-detail-dialog .pool-info-section {
  margin-bottom: 20px;
}

.capital-pool-detail-dialog .info-card {
  border: 1px solid #e4e7ed;
}

.capital-pool-detail-dialog .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.capital-pool-detail-dialog .card-title {
  font-weight: 600;
  color: #303133;
}

.capital-pool-detail-dialog .info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.capital-pool-detail-dialog .info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.capital-pool-detail-dialog .balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: #e6a23c;
}

/* 余额汇总样式 */
.capital-pool-detail-dialog .balance-summary-section {
  margin-bottom: 20px;
}

.capital-pool-detail-dialog .summary-card {
  border: 1px solid #e4e7ed;
  text-align: center;
}

.capital-pool-detail-dialog .summary-item {
  padding: 16px;
}

.capital-pool-detail-dialog .summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.capital-pool-detail-dialog .summary-value {
  font-size: 20px;
  font-weight: 600;
}

.capital-pool-detail-dialog .summary-value.income {
  color: #67c23a;
}

.capital-pool-detail-dialog .summary-value.expense {
  color: #f56c6c;
}

/* 时间轴样式 */
.capital-pool-detail-dialog .balance-chart-section {
  margin-bottom: 20px;
}

.capital-pool-detail-dialog .balance-timeline {
  position: relative;
  padding-left: 30px;
}

.capital-pool-detail-dialog .balance-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e4e7ed;
}

.capital-pool-detail-dialog .timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 20px;
}

.capital-pool-detail-dialog .timeline-marker {
  position: absolute;
  left: -22px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: white;
  z-index: 1;
}

.capital-pool-detail-dialog .timeline-item.is-income .timeline-marker {
  background: #67c23a;
}

.capital-pool-detail-dialog .timeline-item.is-expense .timeline-marker {
  background: #f56c6c;
}

.capital-pool-detail-dialog .timeline-content {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px 16px;
  border-left: 3px solid #e4e7ed;
}

.capital-pool-detail-dialog .timeline-item.is-income .timeline-content {
  border-left-color: #67c23a;
}

.capital-pool-detail-dialog .timeline-item.is-expense .timeline-content {
  border-left-color: #f56c6c;
}

.capital-pool-detail-dialog .timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.capital-pool-detail-dialog .change-amount {
  font-size: 16px;
  font-weight: 600;
}

.capital-pool-detail-dialog .change-amount.income {
  color: #67c23a;
}

.capital-pool-detail-dialog .change-amount.expense {
  color: #f56c6c;
}

.capital-pool-detail-dialog .change-time {
  font-size: 12px;
  color: #909399;
}

.capital-pool-detail-dialog .timeline-body {
  font-size: 14px;
}

.capital-pool-detail-dialog .balance-change {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.capital-pool-detail-dialog .balance-change i {
  margin: 0 8px;
  color: #909399;
}

.capital-pool-detail-dialog .before-balance,
.capital-pool-detail-dialog .after-balance {
  font-weight: 500;
}

.capital-pool-detail-dialog .change-reason {
  color: #606266;
  font-size: 13px;
}

.capital-pool-detail-dialog .reason-label {
  color: #909399;
}

/* 表格样式 */
.capital-pool-detail-dialog .detail-table-section .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.capital-pool-detail-dialog .record-count {
  font-size: 12px;
  color: #909399;
}

.capital-pool-detail-dialog .income-text {
  color: #67c23a;
  font-weight: 500;
}

.capital-pool-detail-dialog .expense-text {
  color: #f56c6c;
  font-weight: 500;
}
</style>
