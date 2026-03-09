<template>
  <div class="app-container">
    <div class="page-header">
      <el-page-header :content="getPageTitle()" @back="handleBack" />
    </div>
    <el-form ref="detailForm" :model="detailData" :rules="formRules" label-width="120px" class="detail-form">
      <!-- 合同相关信息 -->
      <div class="section-card">
        <el-divider content-position="left">
          <i class="el-icon-document" />
          <span>合同相关信息</span>
        </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同编号" prop="contractNo">
            <el-input v-model="detailData.contractNo" placeholder="请选择合同" @focus="openContractSelector">
              <template #append>
                <el-button @click="openContractSelector">选择合同</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同名称" prop="contractName">
            <el-input v-model="detailData.contractName" disabled placeholder="请输入合同名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="甲方" prop="partyA">
            <el-input v-model="detailData.partyAName" disabled placeholder="请输入甲方" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="乙方" prop="partyB">
            <el-input v-model="detailData.partyBName" disabled placeholder="请输入乙方" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同金额" prop="contractReferencePrice">
            <el-input v-model="detailData.contractPrice" disabled placeholder="请输入合同金额">
              <template #prepend>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合作方" prop="contractPartner">
            <el-input v-model="detailData.contractPartnerName" disabled placeholder="请输入合作方" />
          </el-form-item>
        </el-col>
      </el-row>
      </div>

      <!-- 基本信息 -->
      <div class="section-card">
        <el-divider content-position="left">
          <i class="el-icon-info" />
          <span>基本信息</span>
        </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单编号" prop="no">
            <el-input v-model="detailData.no" disabled placeholder="订单编号由系统自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单类型" prop="type">
            <el-select v-model="detailData.type" placeholder="请选择订单类型" style="width: 100%;" :disabled="dialogMode === 'edit'">
              <el-option
                v-for="option in orderTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单总金额" prop="totalAmount">
            <el-input v-model="detailData.totalAmount" disabled placeholder="请输入订单总金额">
              <template #prepend>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="货物总金额" prop="goodsTotalAmount">
            <el-input v-model="detailData.goodsTotalAmount" disabled placeholder="货物总金额由系统自动计算">
              <template #prepend>¥</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="detailData.status" placeholder="请选择状态" style="width: 100%;" :disabled="dialogMode === 'edit'">
              <el-option
                v-for="option in orderStatusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结算时间" prop="settlementTime">
            <el-date-picker
              v-model="detailData.settlementTime"
              type="datetime"
              placeholder="请选择结算时间"
              style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              :disabled="dialogMode === 'add'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="起始时间" prop="startTime">
            <el-date-picker
              v-model="detailData.startTime"
              type="datetime"
              placeholder="请选择起始时间"
              style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="detailData.endTime"
              type="datetime"
              placeholder="请选择结束时间"
              style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上传时间" prop="uploadTime">
            <el-date-picker
              v-model="detailData.uploadTime"
              type="datetime"
              placeholder="请选择上传时间"
              style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="经办人" prop="processor">
            <el-input
              v-model="detailData.processor"
              :readonly="true"
              placeholder="请选择经办人"
              @focus="openAgentSelector"
            >
              <template #append>
                <el-button icon="el-icon-search" @click="openAgentSelector" />
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经办人电话" prop="processorPhone">
            <el-input v-model="detailData.processorPhone" placeholder="请输入经办人电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="detailData.type === 'storage'" :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库地址" prop="warehouseAddress">
            <!--可手填可下拉选择地址-->
            <el-input v-model="detailData.warehouseAddress" placeholder="请输入仓库地址或点击选择">
              <template #append>
                <el-button icon="el-icon-location" @click="openWarehouseSelector">选择地址</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="流转方向">
            <el-select v-model="detailData.flowDirection" placeholder="请选择流转方向" style="width: 100%;">
              <el-option
                v-for="option in flowDirectionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交付地点" prop="deliveryAddress">
            <!--可手填可下拉选择地址-->
            <el-input v-model="detailData.deliveryAddress" placeholder="请输入交付地点或点击选择">
              <template #append>
                <el-button icon="el-icon-location" @click="openDeliverySelector">选择地址</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="走款账号">
            <el-input v-model="detailData.paymentAccount" placeholder="请输入走款账号">
              <template #append>
                <el-button @click="openPaymentAccountSelector">选择账号</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单图片" prop="orderNodeImg">
            <ImageUploader v-model="detailData.orderNodeImg" :multiple="false" :limit="1" />
          </el-form-item>
        </el-col>
      </el-row>
      </div>

      <!-- PDF文件信息 -->
      <div class="section-card">
        <el-divider content-position="left">
          <i class="el-icon-folder-opened" />
          <span>PDF文件信息</span>
        </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="结算文件" prop="settlementPdfUrl">
            <div class="file-info-container">
              <div v-if="detailData.settlementPdfUrl" class="file-info">
                <i class="el-icon-document" style="color: #67c23a; margin-right: 8px;" />
                <span class="file-name">结算单已上传</span>
                <el-button type="primary" size="mini" icon="el-icon-download" @click="downloadFile(detailData.settlementPdfUrl, '结算单')">
                  下载
                </el-button>
              </div>
              <div v-else class="no-file">
                <i class="el-icon-warning" style="color: #e6a23c; margin-right: 8px;" />
                <span>未上传结算文件</span>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请文件" prop="applicationPdfUrl">
            <div class="file-info-container">
              <div v-if="detailData.applicationPdfUrl" class="file-info">
                <i class="el-icon-document" style="color: #67c23a; margin-right: 8px;" />
                <span class="file-name">申请单已上传</span>
                <el-button type="primary" size="mini" icon="el-icon-download" @click="downloadFile(detailData.applicationPdfUrl, '申请单')">
                  下载
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeApplicationFile">
                  删除
                </el-button>
              </div>
              <div v-else class="no-file">
                <i class="el-icon-warning" style="color: #e6a23c; margin-right: 8px;" />
                <span>未上传申请文件</span>
              </div>
              <!-- 申请文件上传区域 -->
              <div class="upload-area">
                <el-upload
                  ref="applicationUpload"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :before-upload="beforeApplicationUpload"
                  :on-success="handleApplicationUploadSuccess"
                  :on-error="handleApplicationUploadError"
                  :show-file-list="false"
                  accept=".pdf"
                  :disabled="applicationUploading"
                >
                  <el-button type="success" size="mini" icon="el-icon-upload" :loading="applicationUploading">
                    {{ applicationUploading ? '上传中...' : '上传申请文件' }}
                  </el-button>
                </el-upload>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      </div>

      <!-- 货物追溯管理 -->
      <div class="section-card">
        <el-divider content-position="left">
          <i class="el-icon-connection" />
          <span>货物追溯管理</span>
        </el-divider>
      <traceability-manager
        v-model:value="detailData.sourceCodes"
        v-model:identify-code="detailData.identifyCode"
        :order-type="detailData.type"
        :can-edit-identify-code="true"
        :current-order-id="detailData.id"
      />
      </div>

      <!-- 订单明细 - 用户手动选择进项或销项 -->
      <div class="section-card">
        <el-divider content-position="left">
          <i class="el-icon-tickets" />
          <span>订单明细</span>
        </el-divider>

      <el-tabs v-model="activeTab" type="card" class="custom-tabs">
        <el-tab-pane label="进项" name="purchase">
          <purchase-item
            :dialog-mode="dialogMode"
            :order-data="detailData"
            :items="inItems"
            :items-loading="itemsLoading"
            @selection-change="handleSelectionChange"
            @recalc-order-amount="recalcOrderAmount"
            @add-item="addOrderItem"
            @delete-items="deleteSelectedItems"
          />
        </el-tab-pane>
        <el-tab-pane label="销项" name="sales">
          <sales-item
            :dialog-mode="dialogMode"
            :sales-items="outItems"
            :sales-items-loading="salesItemsLoading"
            :purchase-items="inItems"
            :order-data="detailData"
            @sales-selection-change="handleSalesSelectionChange"
            @clear-sales-items="clearSalesItems"
            @sync-from-purchase="syncFromPurchaseItems"
          />
        </el-tab-pane>
      </el-tabs>
      </div>
    </el-form>

    <div class="page-footer">
      <div class="button-group">
        <el-button class="footer-btn" icon="el-icon-close" @click="handleCancel">
          取消
        </el-button>
        <el-button class="footer-btn footer-btn-primary" type="primary" icon="el-icon-check" :loading="submitLoading" @click="handleSubmit">
          {{ dialogMode === 'add' ? '新增订单' : '保存修改' }}
        </el-button>
      </div>
      <!-- PDF生成按钮 - 只在编辑模式下显示 -->
      <div v-if="dialogMode === 'edit' && detailData && detailData.id" class="pdf-button-group">
        <el-button class="footer-btn footer-btn-success" type="success" icon="el-icon-document" @click="handleApplicationPDF">
          生成申请单
        </el-button>
        <el-button class="footer-btn footer-btn-warning" type="warning" icon="el-icon-document" @click="handleSettlementPDF">
          生成结算单
        </el-button>
      </div>
    </div>

    <!-- 合同选择弹窗组件 -->
    <contract-selector
      v-model:visible="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      @confirm="handleContractSelected"
    />
    <!-- 经办人选择弹窗组件 -->
    <agent-selector v-model:visible="agentSelectorVisible" title="选择经办人" :multiple="false" @confirm="handleAgentSelected" />
    <!-- 仓库地址选择弹窗组件 -->
    <address-selector
      v-model:visible="warehouseSelectorVisible"
      title="选择仓库地址"
      :multiple="false"
      @confirm="handleWarehouseSelected"
    />
    <!-- 交付地址选择弹窗组件 -->
    <address-selector
      v-model:visible="deliverySelectorVisible"
      title="选择交付地址"
      :multiple="false"
      @confirm="handleDeliverySelected"
    />
    <!-- 银行信息选择弹窗组件 -->
    <bank-info-selector
      v-model:visible="bankInfoSelectorVisible"
      title="选择走款账号"
      :multiple="false"
      @confirm="handleBankInfoSelected"
    />

  </div>
</template>

<script>
import { getRecycleDetail, createRecycle, updateRecycle } from '@/api/recycle'
import { parseTime } from '@/utils'
import { getToken } from '@/utils/auth'
import ImageUploader from '@/components/ImageUploader/index.vue'
import ContractSelector from '@/components/ContractSelector'
import AgentSelector from '@/components/AgentSelector'
import AddressSelector from '@/components/AddressSelector'
import BankInfoSelector from '@/components/BankInfoSelector'
import TraceabilityManager from '@/components/TraceabilityManager'
import { getContractItems } from '@/api/recycleContract'
import PurchaseItem from './item/PurchaseItem.vue'
import SalesItem from './item/SalesItem.vue'
import {
  ORDER_TYPE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  FLOW_DIRECTION_OPTIONS,
  CONTRACT_PARTNER_OPTIONS,
  getOrderStatusTagType,
  getOrderTypeText,
  getOrderStatusText,
  getFlowDirectionText
} from '@/constants/orderTypes'

const BASE_API = (import.meta.env.VITE_BASE_API || '/api').replace(/\/+$/, '')
const ASSET_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_API || '').replace(/\/+$/, '')

export default {
  name: 'OrderEdit',
  components: { ContractSelector, AgentSelector, AddressSelector, BankInfoSelector, ImageUploader, PurchaseItem, SalesItem, TraceabilityManager },
  data() {
    return {
      detailData: {
        identifyCode: '',
        sourceCodes: []
      },
      submitLoading: false,
      // 合同选择弹窗
      contractSelectorVisible: false,
      // 经办人选择弹窗
      agentSelectorVisible: false,
      // 明细加载
      itemsLoading: false,
      // 进项明细数据
      inItems: [],
      // 销项明细数据
      outItems: [],
      // 仓库地址选择弹窗
      warehouseSelectorVisible: false,
      // 交付地址选择弹窗
      deliverySelectorVisible: false,
      // 银行信息选择弹窗
      bankInfoSelectorVisible: false,
      // 枚举选项
      orderTypeOptions: ORDER_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      flowDirectionOptions: FLOW_DIRECTION_OPTIONS,
      contractPartnerOptions: CONTRACT_PARTNER_OPTIONS,
      getOrderTypeText,
      getOrderStatusText,
      getOrderStatusTagType,
      getFlowDirectionText,
      // 表单验证规则
      formRules: {
        type: [
          { required: true, message: '请选择订单类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        processor: [
          { required: true, message: '请输入经办人', trigger: 'blur' }
        ],
        processorPhone: [
          { required: true, message: '请输入经办人电话', trigger: 'blur' }
        ],
        totalAmount: [
          { required: true, message: '请输入订单总金额', trigger: 'blur' }
        ],
        contractNo: [
          { required: true, message: '请输入合同编号', trigger: 'blur' }
        ],
        contractName: [
          { required: true, message: '请输入合同名称', trigger: 'blur' }
        ],
        warehouseAddress: [
          { required: false, message: '请输入仓库地址', trigger: 'blur' }
        ],
        deliveryAddress: [
          { required: false, message: '请输入交付地址', trigger: 'blur' }
        ]
      },
      // 新增订单列表
      orderList: [],
      orderLoading: false,
      // 新增订单明细列表
      orderDetailList: [],
      orderDetailLoading: false,
      // 标签页激活状态
      activeTab: 'purchase',
      // 选中的订单明细项
      selectedItems: [],
      // 销项明细加载状态
      salesItemsLoading: false,
      // 选中的销项明细项
      selectedSalesItems: [],
      // 申请文件上传相关
      applicationUploading: false,
      uploadUrl: BASE_API + '/system/file/upload'
    }
  },
  computed: {
    uploadHeaders() {
      return {
        'Token-Key': getToken()
      }
    },
    dialogMode() {
      // 从路由参数获取模式，如果有orderId则为编辑模式，否则为新增模式
      return this.$route.params.orderId ? 'edit' : 'add'
    },
    currentOrderId() {
      return this.$route.params.orderId || null
    }
  },
  watch: {
    '$route'(to, from) {
      // 路由变化时重新初始化数据
      if (to.name === 'OrderEdit') {
        this.initData()
      }
    }
  },
  created() {
    // 组件创建时初始化数据
    this.initData()
  },
  methods: {
    // 初始化数据
    async initData() {
      if (this.dialogMode === 'add') {
        this.detailData = this.getDefaultFormData()
        // 如果从query参数传入了订单识别码，则设置到表单中
        if (this.$route.query.identifyCode) {
          this.detailData.identifyCode = this.$route.query.identifyCode
        }
        // 新增模式下清空进项和销项数据
        this.inItems = []
        this.outItems = []
      } else if (this.currentOrderId) {
        try {
          const response = await getRecycleDetail(this.currentOrderId)
          this.detailData = response.data

          // 后端返回统一的 items 数组，前端根据 direction 分离
          const items = response.data.items || []
          this.inItems = items.filter(item => item.direction === 'in')
          this.outItems = items.filter(item => item.direction === 'out')

          // 确保追溯数据存在
          if (!this.detailData.identifyCode) {
            this.detailData.identifyCode = ''
          }
          if (!this.detailData.sourceCodes) {
            this.detailData.sourceCodes = []
          }
        } catch (error) {
          this.$message.error('获取订单详情失败')
          this.handleCancel()
        }
      }
      // 初始化订单列表数据
      this.initOrderList()
      // 初始化销项数据（如果没有从后端加载）
      if (!this.outItems || this.outItems.length === 0) {
        this.initSalesData()
      }
    },

    // 打开经办人选择器
    openAgentSelector() {
      this.agentSelectorVisible = true
    },

    // 经办人选择回填
    handleAgentSelected(selected) {
      const agent = Array.isArray(selected) ? selected[0] : selected
      if (!agent) return
      // 经办人显示编号和姓名
      this.detailData.processor = agent.name
      // 回填电话
      this.detailData.processorPhone = agent.phone
    },

    // 打开合同选择器
    openContractSelector() {
      this.contractSelectorVisible = true
    },

    // 合同选择回填
    handleContractSelected(selected) {
      const contract = Array.isArray(selected) ? selected[0] : selected
      if (!contract) return
      // 优先使用合同编号字段，如无则使用ID占位
      this.detailData.contractId = contract.id
      this.detailData.contractNo = contract.no
      this.detailData.contractName = contract.name
      this.detailData.contractPartner = contract.partner
      this.detailData.contractPartnerName = contract.partnerName
      // 甲方。乙方
      this.detailData.partyA = contract.partyA
      this.detailData.partyAName = contract.partyAName
      this.detailData.partyB = contract.partyB
      this.detailData.partyBName = contract.partyBName
      // 合同金额
      this.detailData.contractPrice = contract.totalAmount
    },

    // 获取合同明细并映射到订单明细
    async fetchContractItems(contractId) {
      if (!contractId) return
      this.itemsLoading = true
      try {
        const resp = await getContractItems(contractId)
        const list = resp && resp.data ? (resp.data.records || resp.data || []) : []
        this.inItems = (list || []).map(item => ({
          goodNo: item.goodNo,
          goodType: item.goodType,
          goodName: item.goodName,
          goodModel: item.goodModel,
          goodCount: item.goodCount || 0,
          contractPrice: item.goodPrice || item.contractPrice || 0,
          goodPrice: item.goodPrice || 0,
          goodWeight: item.goodWeight || 0,
          ratingCoefficient: item.ratingCoefficient || 0,
          goodRatingPrice: item.goodRatingPrice || 0,
          otherAdjustAmount: item.otherAdjustAmount || 0,
          goodTotalPrice: this.calcTotal(item),
          goodRemark: item.goodRemark || '',
          direction: 'in'
        }))
        this.recalcOrderAmount()
      } catch (e) {
        this.$message.error('获取合同明细失败')
        this.inItems = []
      } finally {
        this.itemsLoading = false
      }
    },

    // 重新计算订单总金额
    recalcOrderAmount() {
      if (!Array.isArray(this.inItems)) return
      const sum = this.inItems.reduce((acc, it) => acc + (Number(it.goodTotalPrice) || 0), 0)
      this.detailData.totalAmount = Number(sum.toFixed(2))
      // 同步货物总价到货物总金额字段
      this.detailData.goodsTotalAmount = Number(sum.toFixed(2))
    },

    // 打开仓库地址选择器
    openWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 仓库地址选择回填
    handleWarehouseSelected(selected) {
      if (selected && selected.length > 0) {
        const address = selected[0]
        this.detailData.warehouseAddress = address.realAddress
        this.$message.success('仓库地址选择成功')
      }
    },

    // 打开交付地址选择器
    openDeliverySelector() {
      this.deliverySelectorVisible = true
    },

    // 交付地址选择回填
    handleDeliverySelected(selected) {
      if (selected && selected.length > 0) {
        const address = selected[0]
        this.detailData.deliveryAddress = address.realAddress
        this.$message.success('交付地址选择成功')
      }
    },

    // 打开走款账号选择器
    openPaymentAccountSelector() {
      this.bankInfoSelectorVisible = true
    },

    // 处理银行信息选择确认
    handleBankInfoSelected(bankInfos) {
      if (bankInfos && bankInfos.length > 0) {
        const selectedBankInfo = bankInfos[0]
        // 显示格式：开户行 - 银行卡号
        this.detailData.paymentAccount = selectedBankInfo.cardNumber
        this.$message.success('走款账号选择成功')
      }
      this.bankInfoSelectorVisible = false
    },

    // 获取页面标题
    getPageTitle() {
      const titleMap = {
        add: '新增订单',
        edit: '编辑订单',
        view: '订单详情'
      }
      return titleMap[this.dialogMode] || '订单详情'
    },

    // 获取默认表单数据
    getDefaultFormData() {
      return {
        no: '',
        type: ORDER_TYPE_OPTIONS[0].value, // 默认采购订单
        status: ORDER_STATUS_OPTIONS[0].value, // 默认执行中
        startTime: '',
        endTime: '',
        uploadTime: '',
        settlementTime: '', // 结算时间
        identifyCode: '',
        sourceCodes: [],
        processor: '',
        processorPhone: '',
        totalAmount: 0,
        goodsTotalAmount: 0, // 货物总金额
        orderNodeTime: '',
        orderNodeImg: '',
        orderNodePickupLocation: '',
        orderNodeDeliveryLocation: '',
        contractNo: '',
        contractReferencePrice: '',
        contractName: '',
        contractPartner: '',
        warehouseAddress: '',
        deliveryAddress: '',
        paymentAccount: '',
        settlementPdfUrl: '', // 结算文件URL
        applicationPdfUrl: '' // 申请文件URL
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.detailForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const api = this.dialogMode === 'add' ? createRecycle : updateRecycle

          // 构建提交参数
          const params = this.dialogMode === 'add' ? this.detailData : { ...this.detailData, id: this.detailData.id }

          // 合并进项和销项到统一的 items 数组
          // 确保每个项都有正确的 direction 标记
          const inItemsWithDirection = (this.inItems || []).map(item => ({
            ...item,
            direction: 'in'
          }))

          const outItemsWithDirection = (this.outItems || []).map(item => ({
            ...item,
            direction: 'out'
          }))

          // 合并为统一的 items 数组提交给后端
          params.items = [...inItemsWithDirection, ...outItemsWithDirection]

          api(params).then(() => {
            this.$message.success(this.dialogMode === 'add' ? '新增成功' : '保存成功')
            this.handleBack()
          }).catch(() => {
            this.$message.error(this.dialogMode === 'add' ? '新增失败' : '保存失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 取消操作
    handleCancel() {
      this.handleBack()
    },

    // 返回上一页
    handleBack() {
      this.$router.go(-1)
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

    // 移除标签页相关方法，不再需要

    // 初始化订单列表数据
    initOrderList() {
      // 模拟订单数据，实际项目中应该从API获取
      this.orderList = []
    },

    // 查看订单详情
    viewOrderDetail(order) {
      this.$message.info(`查看订单详情：${order.orderNo}`)
      // 这里可以打开订单详情弹窗或跳转到详情页面
      this.$emit('view-order-detail', order)
    },

    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    // 新增订单明细行
    addOrderItem(newItem) {
      // 确保inItems数组存在
      if (!this.inItems) {
        this.inItems = []
      }

      this.inItems.push(newItem)
    },

    // 删除选中的订单明细行
    deleteSelectedItems(selectedItems) {
      // 从原数组中移除选中的项
      selectedItems.forEach(selectedItem => {
        const index = this.inItems.findIndex(item => item === selectedItem)
        if (index > -1) {
          this.inItems.splice(index, 1)
        }
      })

      // 重新计算订单总金额
      this.recalcOrderAmount()
    },

    // 处理销项表格选择变化
    handleSalesSelectionChange(selection) {
      this.selectedSalesItems = selection
    },

    // 清空销项明细
    clearSalesItems() {
      this.outItems = []
      this.selectedSalesItems = []
    },

    // 从进项明细同步数据到销项明细
    syncFromPurchaseItems(newSalesItems) {
      this.outItems = newSalesItems
    },

    // 初始化销项数据
    initSalesData() {
      // 模拟销项数据，实际项目中应该从API获取
      this.outItems = []
    },

    // 生成申请单PDF
    handleApplicationPDF() {
      if (!this.detailData || !this.detailData.id) {
        this.$message.error('订单数据不完整')
        return
      }
      // 跳转到申请单页面
      this.$router.push({
        name: 'ApplicationPDF',
        params: { orderId: this.detailData.id }
      })
    },

    // 生成结算单PDF
    handleSettlementPDF() {
      if (!this.detailData || !this.detailData.id) {
        this.$message.error('订单数据不完整')
        return
      }
      // 跳转到结算单页面
      this.$router.push({
        name: 'SettlementPDF',
        params: { orderId: this.detailData.id }
      })
    },

    // 下载文件
    async downloadFile(fileUrl, fileName) {
      if (!fileUrl) {
        this.$message.warning('文件不存在')
        return
      }

      try {
        // 确保URL是完整的
        let fullUrl = fileUrl
        if (!fileUrl.startsWith('http')) {
          // 如果是相对路径，拼接完整URL
          const path = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
          const base = ASSET_BASE_URL || BASE_API || ''
          fullUrl = base ? base + path : path
        }

        console.log('下载文件，完整URL:', fullUrl)

        // 获取token
        const token = getToken()
        if (!token) {
          this.$message.error('请先登录')
          return
        }

        // 使用fetch下载文件，携带token
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Token-Key': token
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // 获取文件blob
        const blob = await response.blob()

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}_${this.detailData.no || this.detailData.id}_${new Date().getTime()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理URL对象
        window.URL.revokeObjectURL(url)

        this.$message.success('文件下载已开始')
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('文件下载失败：' + (error.message || '未知错误'))
      }
    },

    // 申请文件上传前验证
    beforeApplicationUpload(file) {
      const isPDF = file.type === 'application/pdf'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isPDF) {
        this.$message.error('只能上传PDF格式的文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        return false
      }

      this.applicationUploading = true
      return true
    },

    // 申请文件上传成功
    handleApplicationUploadSuccess(response) {
      console.log('申请文件上传响应:', response)

      if (response && response.code === 200 && response.data) {
        const fileUrl = response.data.fileUrl || response.data.url
        console.log('后端返回的申请文件URL:', fileUrl)

        if (fileUrl) {
          // 确保返回完整的URL
          let fullUrl = fileUrl

          // 如果返回的是相对路径，需要拼接完整URL
          if (!fileUrl.startsWith('http')) {
            const path = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
            const base = ASSET_BASE_URL || BASE_API || ''
            fullUrl = base ? base + path : path
            console.log('拼接后的完整URL:', fullUrl)
          }

          this.detailData.applicationPdfUrl = fullUrl
          console.log('申请文件上传成功，存储的URL:', this.detailData.applicationPdfUrl)
          this.$message.success('申请文件上传成功')
        } else {
          this.$message.error('申请文件上传失败：返回数据缺少文件地址')
        }
      } else {
        this.$message.error('申请文件上传失败：' + (response.message || '未知错误'))
      }

      this.applicationUploading = false
    },

    // 申请文件上传失败
    handleApplicationUploadError(error) {
      console.error('申请文件上传失败:', error)
      this.$message.error('申请文件上传失败，请重试')
      this.applicationUploading = false
    },

    // 删除申请文件
    removeApplicationFile() {
      this.$confirm('确定要删除申请文件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.detailData.applicationPdfUrl = ''
        this.$message.success('申请文件已删除')
      }).catch(() => {
        // 用户取消删除
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  ::v-deep .el-page-header {
    .el-page-header__content {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.page-footer {
  margin-top: 30px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

  .button-group,
  .pdf-button-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .pdf-button-group {
    padding-left: 24px;
    border-left: 2px solid #e4e7ed;
  }

  .footer-btn {
    padding: 12px 32px;
    font-size: 14px;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.footer-btn-primary {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      border: none;

      &:hover {
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
      }
    }

    &.footer-btn-success {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;

      &:hover {
        box-shadow: 0 4px 16px rgba(103, 194, 58, 0.4);
      }
    }

    &.footer-btn-warning {
      background: linear-gradient(135deg, #e6a23c 0%, #f0b86e 100%);
      border: none;

      &:hover {
        box-shadow: 0 4px 16px rgba(230, 162, 60, 0.4);
      }
    }
  }
}

.detail-form {
  .section-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
      transition: all 0.3s ease;
      opacity: 0;
    }

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);

      &::before {
        opacity: 1;
      }
    }

    // 为不同的卡片添加不同的强调色
    &:nth-child(1)::before {
      background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
    }

    &:nth-child(2)::before {
      background: linear-gradient(180deg, #67c23a 0%, #85ce61 100%);
    }

    &:nth-child(3)::before {
      background: linear-gradient(180deg, #e6a23c 0%, #f0b86e 100%);
    }

    &:nth-child(4)::before {
      background: linear-gradient(180deg, #f56c6c 0%, #f89898 100%);
    }

    &:nth-child(5)::before {
      background: linear-gradient(180deg, #909399 0%, #b1b3b8 100%);
    }
  }

  .el-divider {
    margin: 0 0 24px 0;

    .el-divider__text {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      padding: 0 20px;

      i {
        margin-right: 8px;
        font-size: 18px;
        color: #409eff;
      }

      span {
        vertical-align: middle;
      }
    }
  }

  .el-form-item {
    margin-bottom: 20px;
    transition: all 0.3s ease;

    .el-form-item__label {
      font-weight: 500;
      color: #606266;
      line-height: 40px;

      &::before {
        margin-right: 4px;
      }
    }

    // 必填字段标签样式增强
    &.is-required {
      .el-form-item__label::before {
        color: #f56c6c;
        font-weight: bold;
      }
    }

    // 聚焦时的动画效果
    &.is-focus {
      .el-form-item__label {
        color: #409eff;
        font-weight: 600;
      }
    }

    .el-input__inner {
      border-radius: 8px;
      border: 1px solid #dcdfe6;
      transition: all 0.3s ease;
      padding: 0 16px;
      height: 40px;
      line-height: 40px;

      &:hover:not(:disabled) {
        border-color: #b3d8ff;
      }

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        background-color: #fafcff;
      }

      &:disabled {
        background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
        border-color: #e4e7ed;
        color: #909399;
        cursor: not-allowed;
      }
    }

    .el-textarea__inner {
      border-radius: 8px;
      border: 1px solid #dcdfe6;
      transition: all 0.3s ease;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
      }
    }

    .el-select {
      width: 100%;

      .el-input__inner {
        border-radius: 8px;
      }

      .el-input__icon {
        line-height: 40px;
      }
    }

    .el-date-editor {
      width: 100%;

      .el-input__inner {
        border-radius: 8px;
      }

      .el-input__icon {
        line-height: 40px;
      }
    }

    // 按钮样式增强
    .el-button {
      border-radius: 6px;
      transition: all 0.3s ease;
      font-weight: 500;

      &:not(.is-disabled):hover {
        transform: translateY(-1px);
      }

      &:not(.is-disabled):active {
        transform: translateY(0);
      }

      i {
        margin-right: 4px;
      }
    }
  }

  .custom-tabs {
    ::v-deep .el-tabs__header {
      margin-bottom: 20px;
    }

    ::v-deep .el-tabs__item {
      border-radius: 8px 8px 0 0;
      transition: all 0.3s ease;

      &:hover {
        color: #409eff;
      }

      &.is-active {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        color: #fff;
        border-color: #409eff;
      }
    }
  }
}

.amount-text {
  font-weight: 600;
  color: #e6a23c;
  font-size: 16px;
}

// 地址选择器按钮样式
.el-input-group__append {
  .el-button {
    border-radius: 0 8px 8px 0;
    transition: all 0.3s ease;

    &.el-button--primary {
      background-color: #409eff;
      border-color: #409eff;

      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
        transform: scale(1.02);
      }
    }
  }
}

::v-deep .el-input-group {
  .el-input-group__prepend {
    border-radius: 8px 0 0 8px;
    background-color: #f5f7fa;
    border-color: #dcdfe6;
  }

  .el-input-group__append {
    border-radius: 0 8px 8px 0;
    background-color: #f5f7fa;
    border-color: #dcdfe6;
    transition: all 0.3s ease;

    &:hover {
      background-color: #e8ecf1;
    }
  }
}

// PDF文件信息样式
.file-info-container {
  .file-info {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e3f4ff 100%);
    border: 1px solid #b3d8ff;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
      transform: translateY(-1px);
    }

    .file-name {
      flex: 1;
      color: #67c23a;
      font-weight: 500;
      font-size: 14px;
    }

    .el-button {
      margin-left: 8px;
      border-radius: 6px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }

  .no-file {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fdf6ec 0%, #fef3e8 100%);
    border: 1px solid #f5dab1;
    border-radius: 8px;
    color: #e6a23c;
    font-weight: 500;
    margin-bottom: 12px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(230, 162, 60, 0.15);
    }
  }

  .upload-area {
    text-align: center;

    .el-upload {
      display: inline-block;
      width: 100%;
    }

    .el-button {
      width: 100%;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
      }
    }
  }
}

// 添加一些微调动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-card {
  animation: fadeInUp 0.5s ease-out;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }

  &:nth-child(4) {
    animation-delay: 0.4s;
  }

  &:nth-child(5) {
    animation-delay: 0.5s;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }

  .section-card {
    padding: 16px;
  }

  .page-footer {
    flex-direction: column;

    .pdf-button-group {
      padding-left: 0;
      padding-top: 16px;
      border-left: none;
      border-top: 2px solid #e4e7ed;
    }
  }

  .detail-form {
    ::v-deep .el-form-item__label {
      text-align: left;
    }
  }
}

// 添加滚动条美化
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 4px;

  &:hover {
    background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  }
}

// 全局下拉菜单美化
::v-deep .el-select-dropdown {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  .el-select-dropdown__item {
    padding: 0 16px;
    border-radius: 4px;
    margin: 2px 8px;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #f0f9ff 0%, #e3f4ff 100%);
      color: #409eff;
    }

    &.selected {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      color: #fff;
      font-weight: 500;
    }
  }
}

// 日期选择器美化
::v-deep .el-picker-panel {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  .el-date-picker__header {
    margin: 12px;
  }

  .el-picker-panel__content {
    padding: 8px;
  }

  .el-date-table td.today span {
    color: #409eff;
    font-weight: 600;
  }

  .el-date-table td.available:hover {
    color: #409eff;
  }

  .el-date-table td.current:not(.disabled) span {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 50%;
  }
}

// 提示信息美化
::v-deep .el-form-item__error {
  padding-top: 4px;
  padding-left: 4px;
  font-size: 12px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
</style>
