<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>订单信息登记</h2>
    </div>

    <!-- 订单基本信息 -->
    <el-card class="basic-info-card">
      <template #header>
        <div class="clearfix">
          <span>订单基本信息</span>
        </div>
      </template>
      <el-form :model="orderInfo" label-width="120px">
        <div class="info-section">
          <div class="section-title">订单信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="订单编号">
                <el-input v-model="orderInfo.no" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="订单状态阶段">
                {{ getStageText(orderInfo.stage) }}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计价方式">
                <el-input :value="getPricingMethodText(orderInfo.pricingMethod)" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="结算时间">
                <el-input v-model="orderInfo.settlementTime" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="info-section">
          <div class="section-title">金额信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="订单总金额">
                <el-input :value="formatAmount(orderInfo.totalAmount)" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="货物总金额">
                <el-input :value="formatAmount(orderInfo.goodsTotalAmount)" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="其他调价">
                <el-input :value="formatAmount(orderInfo.otherAdjustAmount)" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="用户评级系数">
                <el-input :value="formatAmount(orderInfo.accountCoefficient)" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="info-section">
          <div class="section-title">合同信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="合同编号">
                <el-input v-model="orderInfo.contractNo" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同名称">
                <el-input v-model="orderInfo.contractName" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同伙伴">
                <el-input v-model="orderInfo.contractPartnerName" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="甲方">
                <el-input v-model="orderInfo.partyAName" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="乙方">
                <el-input v-model="orderInfo.partyBName" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>

    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="activeStep" align-center finish-status="success">
        <el-step
          title="采购"
          :class="{ 'step-clickable': 0 <= currentOrderStep, 'step-disabled': 0 > currentOrderStep }"
          @click="handleStepClick(0)"
        />
        <el-step
          v-if="hasTransportStage"
          title="运输"
          :class="{ 'step-clickable': 1 <= currentOrderStep, 'step-disabled': 1 > currentOrderStep }"
          @click="handleStepClick(1)"
        />
        <el-step
          title="加工/入库"
          :class="{ 'step-clickable': (hasTransportStage ? 2 : 1) <= currentOrderStep, 'step-disabled': (hasTransportStage ? 2 : 1) > currentOrderStep }"
          @click="handleStepClick(hasTransportStage ? 2 : 1)"
        />
      </el-steps>
    </div>

    <!-- 表单内容区域 -->
    <el-card class="form-card">
      <!-- 采购阶段 -->
      <div v-show="currentStage === 'purchase'" class="stage-content">
        <h3 class="stage-title">
          <i class="el-icon-shopping-bag"></i> 采购信息
          <el-tag v-if="!canEdit" type="info" size="small" style="margin-left: 10px;">只读</el-tag>
        </h3>

        <el-form ref="purchaseForm" :model="purchaseForm" :rules="canEdit ? purchaseRules : {}" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="对应订单编号">
                <el-input v-model="purchaseForm.orderNo" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="对应订单识别码">
                <el-input v-model="purchaseForm.identifyCode" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购经办人" prop="processorId">
                <el-input
                  v-model="purchaseForm.processorName"
                  :disabled="!canEdit"
                  placeholder="请选择经办人"
                  readonly
                  @focus="showProcessorSelector"
                >
                  <template #append>
                    <el-button type="primary" :disabled="!canEdit" @click="showProcessorSelector">选择经办人</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="位置" prop="deliveryAddress">
                <el-input v-model="purchaseForm.deliveryAddress" :disabled="!canEdit" placeholder="请输入位置" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="走款账号" prop="paymentAccount">
                <el-input v-model="purchaseForm.paymentAccount" :disabled="!canEdit" placeholder="请输入走款账号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分配站点" prop="siteId">
                <el-input
                  v-model="purchaseForm.siteName"
                  :disabled="!canEdit"
                  placeholder="请选择分配站点"
                  readonly
                  @focus="showSiteSelector"
                >
                  <template #append>
                    <el-button type="primary" :disabled="!canEdit" @click="showSiteSelector">选择站点</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="上传时间">
                <el-input v-model="purchaseForm.createTime" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="订单图片" prop="orderNodeImg">
            <ImageUploader
              v-model="purchaseForm.orderNodeImg"
              :disabled="!canEdit"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 运输阶段 -->
      <div v-if="hasTransportStage" v-show="currentStage === 'transport'" class="stage-content">
        <h3 class="stage-title">
          <i class="el-icon-truck"></i> 运输信息
          <el-tag v-if="!canEdit" type="info" size="small" style="margin-left: 10px;">只读</el-tag>
        </h3>
        <el-form ref="transportForm" :model="transportForm" :rules="canEdit ? transportRules : {}" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="对应订单编号">
                <el-input v-model="transportForm.orderNo" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="对应订单识别码">
                <el-input v-model="transportForm.identifyCode" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="运输经办人" prop="processorId">
                <el-input
                  v-model="transportForm.processorName"
                  :disabled="!canEdit"
                  placeholder="请选择运输经办人"
                  readonly
                  @focus="showTransportProcessorSelector"
                >
                  <template #append>
                    <el-button type="primary" :disabled="!canEdit" @click="showTransportProcessorSelector">选择经办人</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="transportForm.startTime"
                  :disabled="!canEdit"
                  type="datetime"
                  placeholder="请选择开始时间"
                  style="width: 100%;"
                  value-format="yyyy-MM-dd HH:mm:ss"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="transportForm.endTime"
                  :disabled="!canEdit"
                  type="datetime"
                  placeholder="请选择结束时间"
                  style="width: 100%;"
                  value-format="yyyy-MM-dd HH:mm:ss"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="运输起点(拿货地址)" prop="pickupAddress">
                <el-input v-model="transportForm.pickupAddress" :disabled="!canEdit" placeholder="请输入运输起点" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运输终点(交付地址)" prop="deliveryAddress">
                <el-input v-model="transportForm.deliveryAddress" :disabled="!canEdit" placeholder="请输入运输终点" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 加工阶段 -->
      <div v-show="currentStage === 'processing'" class="stage-content">
        <h3 class="stage-title">
          <i class="el-icon-setting"></i> 加工信息
          <el-tag v-if="!canEdit" type="info" size="small" style="margin-left: 10px;">只读</el-tag>
        </h3>

        <el-form ref="processingForm" :model="processingForm" :rules="canEdit ? processingRules : {}" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="对应订单编号">
                <el-input v-model="processingForm.orderNo" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="对应订单识别码">
                <el-input v-model="processingForm.identifyCode" placeholder="系统自动生成" readonly disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="加工经办人" prop="processorId">
                <el-input
                  v-model="processingForm.processorName"
                  :disabled="!canEdit"
                  placeholder="请选择加工经办人"
                  readonly
                  @focus="showProcessingProcessorSelector"
                >
                  <template #append>
                    <el-button type="primary" :disabled="!canEdit" @click="showProcessingProcessorSelector">选择经办人</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 货物明细 -->
        <el-form>
          <el-form-item>
            <el-button type="primary" :disabled="!canEdit" @click="addProcessingGoodItem">新增行</el-button>
            <el-button type="danger" :disabled="!canEdit || processingSelectedItems.length === 0" @click="deleteProcessingSelectedItems">删除行</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          :data="processingGoodItems"
          border
          fit
          style="width: 100%"
          @selection-change="handleProcessingSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" :selectable="() => canEdit" />
          <el-table-column prop="goodNo" label="货物编号" fixed="left" width="180" align="center">
            <template #default="scope">
              <el-input :disabled="!canEdit" v-model="scope.row.goodNo" placeholder="选择货物" readonly>
                <template #append>
                  <el-button icon="el-icon-search" :disabled="!canEdit" @click="openProcessingGoodSelector(scope.$index)" />
                </template>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column prop="goodType" label="货物分类" width="160" align="center">
            <template #default="scope">
              <el-input :disabled="true" v-model="scope.row.goodType" placeholder="无分类" />
            </template>
          </el-table-column>
          <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip>
            <template #default="scope">
              <el-input :disabled="true" v-model="scope.row.goodName" placeholder="无名称" />
            </template>
          </el-table-column>
          <el-table-column prop="goodModel" label="货物型号" width="140" align="center">
            <template #default="scope">
              <el-input :disabled="true" v-model="scope.row.goodModel" placeholder="无型号" />
            </template>
          </el-table-column>
          <el-table-column prop="goodCount" label="货物数量" width="155" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.goodCount"
                :disabled="!canEdit"
                style="width:130px;"
                :min="1"
                :precision="0"
              />
            </template>
          </el-table-column>
          <el-table-column prop="goodWeight" label="货物重量(kg)" width="160" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.goodWeight"
                :disabled="!canEdit"
                :min="0"
                :precision="2"
                controls-position="right"
                placeholder="请输入货物重量"
                style="width: 130px;"
              />
            </template>
          </el-table-column>
          <el-table-column prop="goodPrice" label="货物单价(元)" width="160" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.goodPrice"
                :disabled="true"
                :min="0"
                :precision="2"
                controls-position="right"
                placeholder="自动带出"
                style="width: 130px;"
              />
            </template>
          </el-table-column>
          <el-table-column prop="goodRemark" label="货物备注" min-width="180">
            <template #default="scope">
              <el-input :disabled="!canEdit" v-model="scope.row.goodRemark" placeholder="备注" />
            </template>
          </el-table-column>
        </el-table>
      </div>

    </el-card>

    <!-- 底部按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">返回</el-button>
      <!-- <el-button v-if="canEdit" type="primary" :loading="submitLoading" @click="handleSubmit">保存当前阶段</el-button> -->
      <el-button v-if="userOrderData.stage !== USER_ORDER_STAGE.PENDING_SETTLEMENT && userOrderData.stage !== USER_ORDER_STAGE.COMPLETED" type="warning" :loading="settleLoading" @click="handleSettle">结算订单</el-button>
    </div>

    <!-- 采购经办人选择器 -->
    <agent-selector
      v-model:visible="processorSelectorVisible"
      title="选择采购经办人"
      :multiple="false"
      @confirm="handleProcessorSelected"
    />

    <!-- 运输经办人选择器 -->
    <agent-selector
      v-model:visible="transportProcessorSelectorVisible"
      title="选择运输经办人"
      :multiple="false"
      @confirm="handleTransportProcessorSelected"
    />

    <!-- 加工经办人选择器 -->
    <agent-selector
      v-model:visible="processingProcessorSelectorVisible"
      title="选择加工经办人"
      :multiple="false"
      @confirm="handleProcessingProcessorSelected"
    />

    <!-- 加工货物选择器 -->
    <business-scope-selector
      v-model:visible="processingGoodSelectorVisible"
      title="选择货物"
      :multiple="false"
      :only-show-enabled="true"
      @confirm="handleProcessingGoodSelected"
      @close="handleProcessingGoodSelectorClose"
    />

    <!-- 站点选择器 -->
    <site-selector
      v-model:visible="siteSelectorVisible"
      title="选择站点"
      :multiple="false"
      @confirm="handleSiteSelected"
    />
  </div>
</template>

<script>
import { getUserOrderInfo, updateUserOrder, settleUserOrder } from '@/api/userOrder'
import AgentSelector from '@/components/AgentSelector'
import SiteSelector from '@/components/SiteSelector'
import ImageUploader from '@/components/ImageUploader'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'
import {
  USER_ORDER_STAGE,
  getUserOrderStageText,
  getUserOrderStageTagType,
  getUserOrderStatusText,
  getUserOrderStatusTagType,
  getPricingMethodText as getPricingMethodTextFromConst
} from '@/constants/userOrder'

const BASE_API = (import.meta.env.VITE_BASE_API || '/api').replace(/\/+$/, '')
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export default {
  name: 'UserOrderRegister',
  components: {
    AgentSelector,
    SiteSelector,
    ImageUploader,
    BusinessScopeSelector
  },
  data() {
    return {
      submitLoading: false,
      settleLoading: false,
      loading: false,
      orderId: null,
      orderInfo: {},
      userOrderData: {},
      recycleOrderId: null,
      isEdit: false,
      parentId: null,
      USER_ORDER_STAGE, // 将常量添加到 data 中，以便在模板中使用

      // 当前订单阶段
      currentStage: 'purchase',
      activeStep: 0,

      // 采购阶段数据
      processorSelectorVisible: false,
      siteSelectorVisible: false,
      purchaseForm: {
        orderNo: '',
        identifyCode: '',
        processorId: '',
        processorName: '',
        deliveryAddress: '',
        paymentAccount: '',
        siteId: '',
        siteName: '',
        otherPriceAdjustment: 0,
        userCoefficient: 0,
        totalAmount: 0,
        goodsTotalAmount: 0,
        createTime: '',
        orderNodeImg: ''
      },
      purchaseRules: {
        processorId: [
          { required: true, message: '请选择经办人', trigger: 'change' }
        ],
        deliveryAddress: [
          { required: true, message: '请输入位置', trigger: 'blur' }
        ]
      },

      // 运输阶段数据
      transportProcessorSelectorVisible: false,
      transportForm: {
        orderNo: '',
        identifyCode: '',
        processorId: '',
        processorName: '',
        startTime: '',
        endTime: '',
        pickupAddress: '',
        deliveryAddress: '',
        goodsWeight: 0
      },
      transportRules: {
        processorId: [
          { required: true, message: '请选择运输经办人', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        pickupAddress: [
          { required: true, message: '请输入运输起点', trigger: 'blur' }
        ],
        deliveryAddress: [
          { required: true, message: '请输入运输终点', trigger: 'blur' }
        ]
      },

      // 加工阶段数据
      processingProcessorSelectorVisible: false,
      processingGoodSelectorVisible: false,
      processingCurrentRowIndex: -1,
      processingSelectedItems: [],
      processingGoodItems: [],
      processingForm: {
        orderNo: '',
        identifyCode: '',
        processorId: '',
        processorName: ''
      },
      processingRules: {
        processorId: [
          { required: true, message: '请选择加工经办人', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 是否存在运输阶段（非送货上门）
    hasTransportStage() {
      const method = this.userOrderData.transportMethod
      if (!method) {
        return true
      }
      return method !== 'home_delivery'
    },
    // 当前阶段是否可以编辑
    canEdit() {
      return this.currentStage === this.userOrderData.stage
    },
    // 当前订单所处的阶段索引
    // 规则：只要不是「采购 / 运输 / 加工」这三个阶段，其余阶段一律展示为最后一个阶段
    currentOrderStep() {
      const stage = this.userOrderData.stage

      if (this.hasTransportStage) {
        // 包含运输阶段：步骤索引 0=采购, 1=运输, 2=加工/入库，其余全部归为 2
        if (stage === USER_ORDER_STAGE.PURCHASE) return 0
        if (stage === USER_ORDER_STAGE.TRANSPORT) return 1
        if (stage === USER_ORDER_STAGE.PROCESSING) return 2
        // 其他（入库、待确认、待结算、完成等）全部视为最后一步
        return 2
      }

      // 不包含运输阶段：只有 0=采购, 1=加工/入库，其余全部归为 1（最后一步）
      if (stage === USER_ORDER_STAGE.PURCHASE) return 0
      if (stage === USER_ORDER_STAGE.PROCESSING) return 1
      // 其他阶段一律按最后一步处理
      return 1
    }
  },
  watch: {
    'purchaseForm.otherPriceAdjustment'(val) {
      this.orderInfo.otherPriceAdjustment = val
    },
    'purchaseForm.userCoefficient'(val) {
      this.orderInfo.userCoefficient = val
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
      this.orderId = id
      this.parentId = id

      // 加载用户订单信息（包含各阶段订单信息）
      await this.loadUserOrderInfo(id)

      // 根据当前阶段设置初始显示
      this.setCurrentStageByOrder()
    },

    // 根据订单阶段设置当前显示阶段
    // 规则同上：非「采购 / 运输 / 加工」阶段，界面统一停留在最后一个阶段（加工/入库）
    setCurrentStageByOrder() {
      const stage = this.userOrderData.stage

      if (this.hasTransportStage) {
        // 包含运输阶段：0=采购, 1=运输, 2=加工/入库
        if (stage === USER_ORDER_STAGE.PURCHASE) {
          this.currentStage = 'purchase'
          this.activeStep = 0
          return
        }
        if (stage === USER_ORDER_STAGE.TRANSPORT) {
          this.currentStage = 'transport'
          this.activeStep = 1
          return
        }
        // 只要不是采购或运输阶段，一律展示到加工/入库这一步，
        // 且步骤条上所有步骤都显示为已完成（active 设为步骤数 3）
        this.currentStage = 'processing'
        this.activeStep = 3
        return
      }

      // 不包含运输阶段：0=采购, 1=加工/入库
      if (stage === USER_ORDER_STAGE.PURCHASE) {
        this.currentStage = 'purchase'
        this.activeStep = 0
        return
      }
      // 其余阶段（包括加工本身）都视为加工/入库这一步，
      // 且步骤条上所有步骤都显示为已完成（active 设为步骤数 2）
      this.currentStage = 'processing'
      this.activeStep = 2
    },

    // 加载用户订单信息（包含各阶段订单信息）
    async loadUserOrderInfo(id) {
      this.loading = true
      try {
        const response = await getUserOrderInfo(id)
        if (response && response.data) {
          const data = response.data

          // 加载用户订单基本信息
          const userOrder = data.userOrder || {}
          this.userOrderData = userOrder
          this.orderInfo = {
            no: userOrder.no || '',
            settlementTime: userOrder.settlementTime || '',
            stage: userOrder.stage || '',
            status: userOrder.status || '',
            contractNo: userOrder.contractNo || '',
            contractName: userOrder.contractName || '',
            contractPartner: userOrder.contractPartner || '',
            contractPartnerName: userOrder.contractPartnerName || '',
            partyA: userOrder.partyA || '',
            partyAName: userOrder.partyAName || '',
            partyB: userOrder.partyB || '',
            partyBName: userOrder.partyBName || '',
            processorId: userOrder.processorId || '',
            processorName: userOrder.processorName || '',
            location: userOrder.location || '',
            pricingMethod: userOrder.pricingMethod || '',
            imgUrl: userOrder.imgUrl || '',
            totalAmount: userOrder.totalAmount !== undefined ? userOrder.totalAmount : 0,
            goodsTotalAmount: userOrder.goodsTotalAmount !== undefined ? userOrder.goodsTotalAmount : 0,
            otherAdjustAmount: userOrder.otherAdjustAmount !== undefined ? userOrder.otherAdjustAmount : 0,
            accountCoefficient: userOrder.accountCoefficient !== undefined ? userOrder.accountCoefficient : 0
          }

          // 加载采购阶段数据
          const purchaseOrder = data.purchaseOrder || {}
          const otherPriceAdjustment = purchaseOrder.otherPriceAdjustment !== undefined
            ? purchaseOrder.otherPriceAdjustment
            : (userOrder.otherPriceAdjustment !== undefined ? userOrder.otherPriceAdjustment : 0)
          const userCoefficient = purchaseOrder.userCoefficient !== undefined
            ? purchaseOrder.userCoefficient
            : (userOrder.userCoefficient !== undefined ? userOrder.userCoefficient : 0)
          this.purchaseForm = {
            orderNo: purchaseOrder.orderNo || purchaseOrder.no || '',
            identifyCode: purchaseOrder.identifyCode || purchaseOrder.code || '',
            processorId: purchaseOrder.processorId || '',
            processorName: purchaseOrder.processorName || '',
            deliveryAddress: purchaseOrder.deliveryAddress || '',
            paymentAccount: purchaseOrder.paymentAccount || '',
            siteId: purchaseOrder.siteId || '',
            siteName: purchaseOrder.siteName || '',
            otherPriceAdjustment,
            userCoefficient,
            totalAmount: purchaseOrder.totalAmount || 0,
            goodsTotalAmount: purchaseOrder.goodsTotalAmount || 0,
            createTime: purchaseOrder.createTime || '',
            orderNodeImg: purchaseOrder.orderNodeImg || ''
          }
          this.orderInfo.otherPriceAdjustment = otherPriceAdjustment
          this.orderInfo.userCoefficient = userCoefficient

          // 加载运输阶段数据
          const transportOrder = data.transportOrder || {}
          this.transportForm = {
            orderNo: transportOrder.orderNo || transportOrder.no || '',
            identifyCode: transportOrder.identifyCode || transportOrder.code || '',
            processorId: transportOrder.processorId || '',
            processorName: transportOrder.processorName || '',
            startTime: transportOrder.startTime || '',
            endTime: transportOrder.endTime || '',
            pickupAddress: transportOrder.pickupAddress || '',
            deliveryAddress: transportOrder.deliveryAddress || '',
            goodsWeight: transportOrder.goodsWeight || 0
          }

          // 加载加工/入库阶段数据（后端返回字段为 storageOrder，兼容旧的 processingOrder）
          const processingOrder = data.processingOrder || {}
          this.processingForm = {
            orderNo: processingOrder.orderNo || processingOrder.no || '',
            identifyCode: processingOrder.identifyCode || processingOrder.code || '',
            processorId: processingOrder.processorId || '',
            processorName: processingOrder.processorName || ''
          }

          // 加载加工/入库货物明细
          if (processingOrder.items && processingOrder.items.length > 0) {
            this.processingGoodItems = processingOrder.items.map(item => ({ ...item }))
          } else {
            this.processingGoodItems = []
          }
        }
      } catch (error) {
        console.error('获取订单信息失败:', error)
        this.$message.error('获取订单信息失败')
      } finally {
        this.loading = false
      }
    },

    // 处理步骤点击
    handleStepClick(step) {
      // 只能查看当前阶段及之前的阶段
      if (step > this.currentOrderStep) {
        this.$message.warning('只能查看当前阶段及之前的阶段信息')
        return
      }

      if (this.hasTransportStage) {
        // 包含运输阶段
        const stageMap = ['purchase', 'transport', 'processing']
        this.currentStage = stageMap[step]
        this.activeStep = step
        return
      }

      // 不包含运输阶段
      const stageMap = ['purchase', 'processing']
      this.currentStage = stageMap[step]
      this.activeStep = step
    },

    // ====== 采购阶段方法 ======
    // 显示采购经办人选择器
    showProcessorSelector() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      this.processorSelectorVisible = true
    },

    // 采购经办人选择确认
    handleProcessorSelected(agents) {
      if (agents && agents.length > 0) {
        const agent = agents[0]
        this.purchaseForm.processorId = agent.id
        this.purchaseForm.processorName = agent.name || agent.accountName
        if (this.$refs.purchaseForm) {
          this.$refs.purchaseForm.validateField('processorId')
        }
      }
    },

    // 显示站点选择器
    showSiteSelector() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      this.siteSelectorVisible = true
    },

    // 站点选择确认
    handleSiteSelected(sites) {
      if (sites && sites.length > 0) {
        const site = sites[0]
        this.purchaseForm.siteId = site.id
        this.purchaseForm.siteName = site.name
        if (this.$refs.purchaseForm) {
          this.$refs.purchaseForm.validateField('siteId')
        }
      }
    },

    // ====== 运输阶段方法 ======
    // 显示运输经办人选择器
    showTransportProcessorSelector() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      this.transportProcessorSelectorVisible = true
    },

    // 运输经办人选择确认
    handleTransportProcessorSelected(agents) {
      if (agents && agents.length > 0) {
        const agent = agents[0]
        this.transportForm.processorId = agent.id
        this.transportForm.processorName = agent.name || agent.accountName
        if (this.$refs.transportForm) {
          this.$refs.transportForm.validateField('processorId')
        }
      }
    },

    // ====== 加工阶段方法 ======
    // 显示加工经办人选择器
    showProcessingProcessorSelector() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      this.processingProcessorSelectorVisible = true
    },

    // 加工经办人选择确认
    handleProcessingProcessorSelected(agents) {
      if (agents && agents.length > 0) {
        const agent = agents[0]
        this.processingForm.processorId = agent.id
        this.processingForm.processorName = agent.name || agent.accountName
        if (this.$refs.processingForm) {
          this.$refs.processingForm.validateField('processorId')
        }
      }
    },

    // 打开加工货物选择器
    openProcessingGoodSelector(rowIndex) {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      this.processingCurrentRowIndex = rowIndex
      this.processingGoodSelectorVisible = true
    },

    // 加工货物选择确认
    handleProcessingGoodSelected(selectedItems) {
      if (selectedItems && selectedItems.length > 0 && this.processingCurrentRowIndex >= 0) {
        const selectedItem = selectedItems[0]
        const currentRow = this.processingGoodItems[this.processingCurrentRowIndex]
        if (currentRow) {
          currentRow.goodNo = selectedItem.no || ''
          currentRow.goodType = selectedItem.goodType || ''
          currentRow.goodName = selectedItem.goodName || ''
          currentRow.goodModel = selectedItem.goodModel || ''
          currentRow.goodCount = currentRow.goodCount || 1
          currentRow.goodWeight = currentRow.goodWeight || 0
          // 货物单价：从经营范围的公示价格带入到加工明细的 goodPrice 字段
          currentRow.goodPrice = selectedItem.publicPrice || 0
        }
      }
      this.processingGoodSelectorVisible = false
    },

    // 关闭加工货物选择器
    handleProcessingGoodSelectorClose() {
      this.processingGoodSelectorVisible = false
      this.processingCurrentRowIndex = -1
    },

    // 新增加工货物行
    addProcessingGoodItem() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      const newItem = {
        goodNo: '',
        goodType: '',
        goodName: '',
        goodModel: '',
        goodCount: 1,
        goodWeight: 0,
        goodPrice: 0,
        goodRemark: ''
      }
      this.processingGoodItems.push(newItem)
      this.$message.success('新增行成功')
    },

    // 删除选中的加工货物行
    deleteProcessingSelectedItems() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }
      if (this.processingSelectedItems.length === 0) {
        this.$message.warning('请先选择要删除的行')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.processingSelectedItems.length} 行数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.processingSelectedItems.forEach(selectedItem => {
          const index = this.processingGoodItems.findIndex(item => item === selectedItem)
          if (index > -1) {
            this.processingGoodItems.splice(index, 1)
          }
        })
        this.processingSelectedItems = []
        this.$message.success('删除成功')
      }).catch(() => {})
    },

    // 处理加工货物表格选择变化
    handleProcessingSelectionChange(selection) {
      this.processingSelectedItems = selection
    },

    // ====== 提交方法 ======
    async handleSubmit() {
      if (!this.canEdit) {
        this.$message.warning('当前阶段不可编辑')
        return
      }

      // 根据当前阶段进行不同的保存操作
      switch (this.currentStage) {
        case 'purchase':
          await this.submitPurchase()
          break
        case 'transport':
          await this.submitTransport()
          break
        case 'processing':
          await this.submitProcessing()
          break
      }
    },

    // 提交采购信息
    async submitPurchase() {
      if (!this.$refs.purchaseForm) return

      this.$refs.purchaseForm.validate(async(valid) => {
        if (!valid) {
          return false
        }
        this.submitLoading = true
        try {
          // 更新用户订单的采购信息
          const updateData = {
            id: this.orderId,
            purchaseOrderNo: this.purchaseForm.orderNo,
            purchaseOrderCode: this.purchaseForm.identifyCode,
            processorId: this.purchaseForm.processorId,
            processorName: this.purchaseForm.processorName,
            deliveryAddress: this.purchaseForm.deliveryAddress,
            paymentAccount: this.purchaseForm.paymentAccount,
            siteId: this.purchaseForm.siteId,
            siteName: this.purchaseForm.siteName
          }

          await updateUserOrder(updateData)
          this.$message.success('保存成功')

          // 重新加载数据
          await this.loadUserOrderInfo(this.orderId)
        } catch (error) {
          console.error('保存失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 提交运输信息
    async submitTransport() {
      if (!this.$refs.transportForm) return

      this.$refs.transportForm.validate(async(valid) => {
        if (!valid) {
          return false
        }
        this.submitLoading = true
        try {
          // 更新用户订单的运输信息
          const updateData = {
            id: this.orderId,
            transportOrderNo: this.transportForm.orderNo,
            transportOrderCode: this.transportForm.identifyCode,
            transportProcessorId: this.transportForm.processorId,
            transportProcessorName: this.transportForm.processorName,
            transportStartTime: this.transportForm.startTime,
            transportEndTime: this.transportForm.endTime,
            transportpickupAddress: this.transportForm.pickupAddress,
            transportdeliveryAddress: this.transportForm.deliveryAddress
          }

          await updateUserOrder(updateData)
          this.$message.success('保存成功')

          // 重新加载数据
          await this.loadUserOrderInfo(this.orderId)
        } catch (error) {
          console.error('保存失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 提交加工信息
    async submitProcessing() {
      if (!this.$refs.processingForm) return

      this.$refs.processingForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        // 验证货物明细
        if (this.processingGoodItems.length === 0) {
          this.$message.warning('请至少添加一条货物明细')
          return
        }

        for (let i = 0; i < this.processingGoodItems.length; i++) {
          const item = this.processingGoodItems[i]
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
          // 更新用户订单的加工信息
          const updateData = {
            id: this.orderId,
            processingOrderNo: this.processingForm.orderNo,
            processingOrderCode: this.processingForm.identifyCode,
            processingProcessorId: this.processingForm.processorId,
            processingProcessorName: this.processingForm.processorName,
            processingGoodItems: this.processingGoodItems.map(item => ({ ...item }))
          }

          await updateUserOrder(updateData)
          this.$message.success('保存成功')

          // 重新加载数据
          await this.loadUserOrderInfo(this.orderId)
        } catch (error) {
          console.error('保存失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 取消
    handleCancel() {
      this.$router.push({ name: 'UserOrderList' })
    },

    // 结算订单
    async handleSettle() {
      try {
        await this.$confirm('结算后订单信息不可修改，是否结算？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.settleLoading = true

        // 根据当前阶段获取对应的登记信息
        let settleData = {}

        switch (this.currentStage) {
          case 'purchase':
            // 采购阶段：传递采购表单数据
            settleData = {
              id: this.orderId,
              ...this.purchaseForm
            }
            break
          case 'transport':
            // 运输阶段：传递运输表单数据
            settleData = {
              id: this.orderId,
              ...this.transportForm
            }
            break
          case 'processing':
            // 加工阶段：传递加工表单数据和货物明细
            settleData = {
              id: this.orderId,
              ...this.processingForm,
              items: this.processingGoodItems.map(item => ({ ...item }))
            }
            break
          default:
            settleData = { id: this.orderId }
        }

        await settleUserOrder(settleData)
        this.$message.success('结算成功')

        // 返回列表页面
        this.$router.push({ name: 'UserOrderList' })
      } catch (error) {
        if (error !== 'cancel') {
          console.error('结算订单失败:', error)
          this.$message.error('结算订单失败')
        }
      } finally {
        this.settleLoading = false
      }
    },

    // ====== 辅助方法 ======
    // 获取订单状态阶段文本
    getStageText(stage) {
      return getUserOrderStageText(stage)
    },

    // 获取订单状态阶段标签类型
    getStageTagType(stage) {
      return getUserOrderStageTagType(stage)
    },

    // 获取订单状态文本
    getStatusText(status) {
      return getUserOrderStatusText(status)
    },

    // 获取订单状态标签类型
    getStatusTagType(status) {
      return getUserOrderStatusTagType(status)
    },

    // 获取计价方式显示文本
    getPricingMethodText(method) {
      return getPricingMethodTextFromConst(method)
    },

    // 格式化金额显示
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

    // 显示图片URL（处理相对路径和绝对路径）
    displayUrl(url) {
      if (!url) return ''
      // 如果是绝对路径，直接返回
      if (/^(https?:)?\/\//.test(url)) {
        return url
      }
      // 如果是相对路径，拼接基础URL
      const baseUrl = API_BASE_URL || BASE_API
      return baseUrl + (url.startsWith('/') ? url : '/' + url)
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
      font-size: 24px;
      font-weight: 500;
      color: #303133;
    }
  }

  .basic-info-card {
    margin-bottom: 20px;

    .info-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        padding: 8px 12px;
        background: #f5f7fa;
        border-left: 3px solid #409EFF;
        margin-bottom: 15px;
      }
    }

    .order-image-preview {
      display: flex;
      align-items: center;
    }

    ::v-deep .el-form-item__content {
      line-height: normal;
    }
  }

  .steps-container {
    background: #fff;
    padding: 30px 20px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    ::v-deep .el-step__title {
      font-size: 16px;
      font-weight: 500;
    }

    ::v-deep .el-step__head {
      cursor: pointer;
    }

    // 可点击的步骤
    .step-clickable {
      ::v-deep .el-step__head {
        cursor: pointer;
      }

      &:hover ::v-deep .el-step__title {
        color: #409EFF;
      }
    }

    // 不可点击的步骤（后续步骤）
    .step-disabled {
      ::v-deep .el-step__head {
        cursor: not-allowed;
        opacity: 0.5;
      }

      ::v-deep .el-step__title {
        color: #C0C4CC !important;
      }

      ::v-deep .el-step__icon {
        opacity: 0.5;
      }

      ::v-deep .el-step__line {
        opacity: 0.3;
      }
    }
  }

  .form-card {
    margin-bottom: 20px;
    min-height: 400px;

    .stage-content {
      .stage-title {
        margin: 0 0 20px 0;
        padding-bottom: 15px;
        font-size: 18px;
        font-weight: 500;
        color: #303133;
        border-bottom: 2px solid #f0f0f0;
        display: flex;
        align-items: center;

        i {
          margin-right: 8px;
          font-size: 20px;
        }
      }

      .amount-text {
        font-weight: 600;
        color: #e6a23c;
      }
    }
  }

  .form-footer {
    padding: 20px;
    text-align: right;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
