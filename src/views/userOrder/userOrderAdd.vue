<template>
  <div class="app-container">
    <div class="page-header">
      <h2>用户订单</h2>
    </div>

      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单编号">
              <el-input v-model="form.no" placeholder="系统自动生成" readonly disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算时间">
              <el-input v-model="form.settlementTime" placeholder="系统自动生成" readonly disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单总金额">
              <el-input :value="formatAmount(form.totalAmount)" readonly disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物总金额">
              <el-input :value="formatAmount(form.goodsTotalAmount)" readonly disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="其他调价">
              <el-input-number
                v-model="form.otherAdjustAmount"
                :precision="2"
                :step="0.01"
                :controls="false"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户系数">
              <el-input-number
                v-model="form.accountCoefficient"
                :precision="2"
                :step="0.01"
                :controls="false"
                disabled
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户评分">
              <el-input
                v-model="form.accountRatingLevel"
                placeholder="系统自动生成"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态阶段">
              <el-select v-model="form.stage" placeholder="请选择订单状态阶段" style="width: 100%;" disabled>
                <el-option
                  v-for="item in stageOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" placeholder="请选择订单状态" style="width: 100%;" disabled>
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同" prop="contractId">
              <el-input
                v-model="form.contractName"
                placeholder="请选择合同"
                readonly
                :disabled="isEdit"
                @focus="showContractSelector"
              >
                <template #append>
                  <el-button type="primary" :disabled="isEdit" @click="showContractSelector">选择合同</el-button>
                </template>
              </el-input>
              <div v-if="form.contractNo" style="margin-top: 8px; color: #666; font-size: 12px;">
                合同编号：{{ form.contractNo }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="甲方" prop="partyA">
              <el-input
                v-model="form.partyAName"
                placeholder="请先选择合同"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="乙方" prop="partyB">
              <el-input
                v-model="form.partyBName"
                placeholder="请先选择合同"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="合作方" prop="contractPartner">
              <el-input
                v-model="form.contractPartnerName"
                placeholder="请先选择合同"
                readonly
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计价方式" prop="pricingMethod">
              <el-select v-model="form.pricingMethod" placeholder="请选择计价方式" style="width: 100%;" :disabled="isEdit">
                <el-option
                  v-for="item in pricingMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输方式" prop="transportMethod">
              <el-select v-model="form.transportMethod" placeholder="请选择运输方式" style="width: 100%;">
                <el-option
                  v-for="item in transportMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 底部按钮 -->
      <div class="form-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '保存' }}
        </el-button>
      </div>

    <!-- 合同选择器 -->
    <ContractSelector
      v-model:visible="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      @confirm="handleContractSelected"
    />

  </div>
</template>

<script>
import { createUserOrder, updateUserOrder, getUserOrderDetail } from '@/api/userOrder'
import ContractSelector from '@/components/ContractSelector'
import {
  USER_ORDER_STAGE_OPTIONS,
  USER_ORDER_STATUS_OPTIONS,
  PRICING_METHOD_OPTIONS,
  PRICING_METHOD
} from '@/constants/userOrder'
import { getUserDetail } from '@/api/user'

export default {
  name: 'UserOrderAdd',
  components: {
    ContractSelector
  },
  data() {
    return {
      submitLoading: false,
      isEdit: false,
      orderId: null,
      contractSelectorVisible: false,
      fetchingUserCoefficient: false,

      // 表单数据
      form: {
        id: '',
        no: '',
        stage: '',
        status: '',
        contractId: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        partyA: '',
        partyAName: '',
        partyB: '',
        partyBName: '',
        pricingMethod: PRICING_METHOD.GENERAL,
        settlementTime: '',
        totalAmount: 0,
        goodsTotalAmount: 0,
        otherAdjustAmount: 0,
        accountCoefficient: 0,
        accountRatingLevel: '',
        transportMethod: ''
      },

      // 表单验证规则
      rules: {
        contractId: [
          { required: true, message: '请选择合同', trigger: 'change' }
        ],
        pricingMethod: [
          { required: true, message: '请选择计价方式', trigger: 'change' }
        ],
        transportMethod: [
          { required: true, message: '请选择运输方式', trigger: 'change' }
        ]
      },

      // 订单状态阶段选项
      stageOptions: USER_ORDER_STAGE_OPTIONS,

      // 订单状态选项
      statusOptions: USER_ORDER_STATUS_OPTIONS,

      // 计价方式选项
      pricingMethodOptions: PRICING_METHOD_OPTIONS,

      // 运输方式选项
      transportMethodOptions: [
        { label: '送货上门', value: 'home_delivery' },
        { label: '上门回收', value: 'door_to_door_recycle' }
      ]
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    // 初始化数据
    async initData() {
      const id = this.$route.query.id
      if (id) {
        this.isEdit = true
        this.orderId = id
        await this.loadOrderDetail(id)
      } else {
        this.isEdit = false
        this.resetForm()
      }
    },

    // 加载订单详情
    async loadOrderDetail(id) {
      try {
        const response = await getUserOrderDetail({ id })
        if (response && response.data) {
          const data = response.data
          this.form = {
            id: data.id,
            no: data.no || '',
            stage: data.stage || '',
            status: data.status || '',
            contractId: data.contractId || '',
            contractNo: data.contractNo || '',
            contractName: data.contractName || '',
            contractPartner: data.contractPartner || '',
            contractPartnerName: data.contractPartnerName || '',
            partyA: data.partyA || '',
            partyAName: data.partyAName || '',
            partyB: data.partyB || '',
            partyBName: data.partyBName || '',
            pricingMethod: data.pricingMethod || PRICING_METHOD.GENERAL,
            settlementTime: data.settlementTime || '',
            totalAmount: data.totalAmount || 0,
            goodsTotalAmount: data.goodsTotalAmount || 0,
            otherAdjustAmount: data.otherAdjustAmount || 0,
            accountCoefficient: data.accountCoefficient || 0,
            accountRatingLevel: data.accountRatingLevel || '',
            transportMethod: data.transportMethod || ''
          }
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      }
    },

    // 重置表单
    resetForm() {
      this.form = {
        id: '',
        no: '',
        stage: '',
        status: '',
        contractId: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        partyA: '',
        partyAName: '',
        partyB: '',
        partyBName: '',
        pricingMethod: PRICING_METHOD.GENERAL,
        settlementTime: '',
        totalAmount: 0,
        goodsTotalAmount: 0,
        otherAdjustAmount: 0,
        accountCoefficient: 0,
        accountRatingLevel: '',
        transportMethod: ''
      }
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    // 显示合同选择器
    showContractSelector() {
      if (this.isEdit) {
        this.$message.warning('编辑模式下无法修改合同')
        return
      }
      this.contractSelectorVisible = true
    },

    // 合同选择确认
    handleContractSelected(contracts) {
      if (contracts && contracts.length > 0) {
        const contract = contracts[0]
        this.form.contractId = contract.id
        this.form.contractNo = contract.no
        this.form.contractName = contract.name
        // 从合同数据中自动填充合作方
        this.form.contractPartner = contract.partner || ''
        this.form.contractPartnerName = contract.partnerName || ''
        // 从合同数据中自动填充甲方
        this.form.partyA = contract.partyA || ''
        this.form.partyAName = contract.partyAName || ''
        // 从合同数据中自动填充乙方
        this.form.partyB = contract.partyB || ''
        this.form.partyBName = contract.partyBName || ''
        this.$refs.form.validateField('contractId')
        this.fetchUserCoefficient(contract.partner)
      }
    },

    // 金额显示格式化
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === '') {
        return ''
      }
      const num = Number(amount)
      if (Number.isNaN(num)) {
        return amount
      }
      return num.toFixed(2)
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.submitLoading = true
        try {
          if (this.isEdit) {
            await updateUserOrder(this.form)
            this.$message.success('更新订单成功')
          } else {
            await createUserOrder(this.form)
            this.$message.success('创建订单成功')
          }
          this.$router.push({ name: 'UserOrderList' })
        } catch (error) {
          console.error(this.isEdit ? '更新订单失败' : '创建订单失败:', error)
          this.$message.error(this.isEdit ? '更新订单失败' : '创建订单失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 取消
    handleCancel() {
      this.$router.push({ name: 'UserOrderList' })
    },

    // 根据合作方ID获取用户系数
    async fetchUserCoefficient(partnerId) {
      if (!partnerId) {
        this.form.accountCoefficient = 0
        this.form.accountRatingLevel = ''
        return
      }
      if (this.fetchingUserCoefficient) return
      this.fetchingUserCoefficient = true
      try {
        const res = await getUserDetail(partnerId)
        const data = res.data
        const coefficient = data.scoreFactor
        const parsed = Number(coefficient)
        this.form.accountCoefficient = Number.isNaN(parsed) ? 0 : parsed
        // 赋值用户评分
        this.form.accountRatingLevel = data.score || ''
      } catch (error) {
        console.error('获取用户系数失败:', error)
        this.form.accountCoefficient = 0
        this.form.accountRatingLevel = ''
        this.$message.error('获取用户系数失败：' + error.message)
      } finally {
        this.fetchingUserCoefficient = false
      }
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
    max-width: 1200px;
    margin: 0 auto;
  }

  .form-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
