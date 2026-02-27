<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="订单编号">
        <el-input
          v-model="searchForm.no"
          placeholder="请输入订单编号"
          clearable
          style="width: 180px;"
        />
      </el-form-item>
      <el-form-item label="订单状态阶段">
        <el-select
          v-model="searchForm.stage"
          placeholder="请选择订单状态阶段"
          clearable
          style="width: 150px;"
        >
          <el-option
            v-for="item in stageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择订单状态"
          clearable
          style="width: 150px;"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">添加订单</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="no" label="订单编号" width="200">
        <template #default="scope">
          <el-link type="primary" @click="handleEdit(scope.row)">{{ scope.row.no }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="contractNo" label="合同编号" width="200" />
      <el-table-column prop="contractName" label="合同名称" width="150" show-overflow-tooltip />
      <el-table-column prop="stage" label="订单状态阶段" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getStageTagType(scope.row.stage)" size="small">
            {{ getStageText(scope.row.stage) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="settlementStatus" label="结算状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getSettlementStatusTagType(scope.row.settlementStatus)" size="small">
            {{ getSettlementStatusText(scope.row.settlementStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryStatus" label="交付状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getDeliveryStatusTagType(scope.row.deliveryStatus)" size="small">
            {{ getDeliveryStatusText(scope.row.deliveryStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="settlementTime" label="结算完成时间" width="180" >
        <template #default="scope">
          {{ scope.row.settlementTime || '订单尚未完成' }}
        </template>
      </el-table-column> -->
      <el-table-column label="操作" width="400" fixed="right">
        <template #default="scope">
          <el-button size="mini" type="success" @click="handleRegisterInfo(scope.row)">登记信息</el-button>
          <el-button size="mini" type="primary" @click="handleSupplementMaterials(scope.row)">材料</el-button>
          <el-button v-if="scope.row.deliveryStatus === DELIVERY_STATUS.NOT_DELIVERED" size="mini" type="warning" @click="handleDelivery(scope.row)">交付</el-button>
          <el-button v-if="scope.row.deliveryStatus === DELIVERY_STATUS.DELIVERED" size="mini" type="info" @click="handleViewDelivery(scope.row)">查看交付</el-button>
          <el-button v-if="scope.row.stage === 'pending_settlement' || scope.row.settlementStatus === 'rejected'" size="mini" type="info" @click="handleSettle(scope.row)">确认结算</el-button>

          <el-button v-if="scope.row.stage === USER_ORDER_STAGE.PURCHASE" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <!-- <el-dropdown @command="(command) => handleMoreAction(command, scope.row)">
            <el-button size="mini">
              更多<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="previewSettlement">预览结算单</el-dropdown-item>
                <el-dropdown-item command="previewApplication">预览申请单</el-dropdown-item>
                <el-dropdown-item command="previewDelivery">预览交付单</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown> -->
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 确认结算对话框 -->
    <el-dialog
      title="确认订单结算"
      v-model="settlementDialogVisible"
      width="500px"
      @close="handleSettlementDialogClose"
    >
      <el-form
        ref="settlementForm"
        :model="settlementForm"
        :rules="settlementRules"
        label-width="120px"
      >
        <el-form-item label="订单编号">
          <span>{{ currentOrder.no }}</span>
        </el-form-item>
        <el-form-item label="其他调价" prop="otherAdjustAmount">
          <el-input-number
            v-model="settlementForm.otherAdjustAmount"
            :precision="2"
            :step="0.01"
            placeholder="请输入其他调价金额"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="settlementDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="settlementSubmitLoading" @click="handleSettlementSubmit">确认结算</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 材料对话框 -->
    <el-dialog
      title="材料"
      v-model="supplementDialogVisible"
      width="600px"
      @close="handleSupplementDialogClose"
    >
      <el-form
        ref="supplementForm"
        :model="supplementForm"
        :rules="supplementRules"
        label-width="120px"
      >
        <el-form-item label="结算单PDF" prop="settlementPdf">
          <FileUploader
            v-model="supplementForm.settlementPdf"
            button-mode
            :limit="1"
            accept=".pdf"
            :prepend-base-url="false"
            tips="只能上传PDF文件，且不超过10MB"
            @input="() => handleFileChange('settlementPdf')"
          />
        </el-form-item>
        <el-form-item label="申请单PDF" prop="applicationPdf">
          <FileUploader
            v-model="supplementForm.applicationPdf"
            button-mode
            :limit="1"
            accept=".pdf"
            :prepend-base-url="false"
            tips="只能上传PDF文件，且不超过10MB"
            @input="() => handleFileChange('applicationPdf')"
          />
        </el-form-item>
        <el-form-item label="交付单PDF" prop="deliveryPdf">
          <FileUploader
            v-model="supplementForm.deliveryPdf"
            button-mode
            :limit="1"
            accept=".pdf"
            :prepend-base-url="false"
            tips="只能上传PDF文件，且不超过10MB"
            @input="() => handleFileChange('deliveryPdf')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="supplementDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="supplementSubmitLoading" @click="handleSupplementSubmit">提交材料</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 交付对话框 -->
    <el-dialog
      :title="(deliveryViewMode ? '查看交付 - ' : '订单交付 - ') + currentOrder.no"
      v-model="deliveryDialogVisible"
      width="700px"
      @close="handleDeliveryDialogClose"
    >
      <!-- 第一步：选择交付模式 -->
      <div v-if="deliveryStep === 1 && !deliveryViewMode">
        <h3>请选择交付模式</h3>
        <el-radio-group v-model="deliveryMethod" size="large" style="display: flex; flex-direction: column; gap: 20px;">
          <el-radio label="online" border style="width: 50%; margin-left: 10px;">
            <span>线上交付</span>
            <p style=" color: #909399;">需填写交付时间、上传交付照片和签字照片</p>
          </el-radio>
          <el-radio label="offline" border style="width: 50%;">
            <span>线下交付</span>
            <p style=" color: #909399;">需上传交付单（PDF格式）</p>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 第二步：填写交付信息 -->
      <div v-if="deliveryStep === 2">
        <!-- 线上交付表单 -->
        <el-form
          v-if="deliveryMethod === 'online'"
          ref="deliveryOnlineForm"
          :model="deliveryOnlineForm"
          :rules="deliveryViewMode ? {} : deliveryOnlineRules"
          label-width="120px"
        >
          <el-form-item label="交付时间" prop="deliveryTime">
            <el-date-picker
              v-model="deliveryOnlineForm.deliveryTime"
              :disabled="deliveryViewMode"
              type="datetime"
              placeholder="请选择交付时间"
              style="width: 100%;"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>

          <el-form-item label="交付照片" prop="deliveryPhoto">
            <ImageUploader
              v-model="deliveryOnlineForm.deliveryPhoto"
              :disabled="deliveryViewMode"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>

          <el-form-item label="合作方签字" prop="partnerSignature">
            <ImageUploader
              v-model="deliveryOnlineForm.partnerSignature"
              :disabled="deliveryViewMode"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>

          <el-form-item label="经办人签字" prop="processorSignature">
            <ImageUploader
              v-model="deliveryOnlineForm.processorSignature"
              :disabled="deliveryViewMode"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>
        </el-form>

        <!-- 线下交付表单 -->
        <el-form
          v-else-if="deliveryMethod === 'offline'"
          ref="deliveryOfflineForm"
          :model="deliveryOfflineForm"
          :rules="deliveryViewMode ? {} : deliveryOfflineRules"
          label-width="120px"
        >
          <el-form-item label="交付单(PDF)" prop="deliveryPDF">
            <FileUploader
              v-model="deliveryOfflineForm.deliveryPDF"
              :disabled="deliveryViewMode"
              button-mode
              :limit="1"
              accept=".pdf"
              :prepend-base-url="false"
              tips="只能上传PDF文件，且不超过10MB"
              @input="() => handleDeliveryPDFChange()"
            />
          </el-form-item>
        </el-form>

        <!-- 没有交付信息时的提示 -->
        <div v-else-if="deliveryViewMode && !deliveryMethod" style="text-align: center; padding: 40px 0; color: #909399;">
          <i class="el-icon-info" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>该订单暂无交付信息</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deliveryDialogVisible = false">{{ deliveryViewMode ? '关闭' : '取消' }}</el-button>
          <el-button v-if="deliveryStep === 1 && !deliveryViewMode" type="primary" :disabled="!deliveryMethod" @click="handleNextStep">下一步</el-button>
          <el-button v-if="deliveryStep === 2 && !deliveryViewMode" @click="deliveryStep = 1">上一步</el-button>
          <el-button v-if="deliveryStep === 2 && !deliveryViewMode" type="primary" :loading="deliverySubmitLoading" @click="handleDeliverySubmit">提交交付</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看交付对话框 (新增) -->
    <el-dialog
      :title="'查看交付 - ' + currentOrder.no"
      v-model="viewDeliveryDialogVisible"
      width="700px"
      @close="handleViewDeliveryDialogClose"
    >
      <div>
        <!-- 线上交付展示 -->
        <el-form
          v-if="deliveryMethod === 'online'"
          label-width="120px"
        >
          <el-form-item label="交付时间">
            <el-input :value="deliveryOnlineForm.deliveryTime" disabled style="width: 100%;" />
          </el-form-item>

          <el-form-item label="交付照片">
            <ImageUploader
              v-model="deliveryOnlineForm.deliveryPhoto"
              disabled
              :multiple="false"
              :limit="1"
              list-type="picture-card"
            />
          </el-form-item>

          <el-form-item label="合作方签字">
            <ImageUploader
              v-model="deliveryOnlineForm.partnerSignature"
              disabled
              :multiple="false"
              :limit="1"
              list-type="picture-card"
            />
          </el-form-item>

          <el-form-item label="经办人签字">
            <ImageUploader
              v-model="deliveryOnlineForm.processorSignature"
              disabled
              :multiple="false"
              :limit="1"
              list-type="picture-card"
            />
          </el-form-item>
        </el-form>

        <!-- 线下交付展示 -->
        <el-form
          v-else-if="deliveryMethod === 'offline'"
          label-width="120px"
        >
          <el-form-item label="交付单(PDF)">
             <el-button
               type="primary"
               size="small"
               icon="el-icon-document"
               @click="handleViewPdf(deliveryOfflineForm.deliveryPDF)"
             >
               查看文件
             </el-button>
          </el-form-item>
        </el-form>

        <!-- 无信息提示 -->
        <div v-else style="text-align: center; padding: 40px 0; color: #909399;">
          <i class="el-icon-info" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>该订单暂无交付信息</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDeliveryDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { getUserOrderListPage, deleteUserOrder, submitDelivery, confirmSettlement, saveOrderMaterials } from '@/api/userOrder'
import ImageUploader from '@/components/ImageUploader'
import FileUploader from '@/components/FileUploader'
import {
  USER_ORDER_STAGE_OPTIONS,
  USER_ORDER_STATUS_OPTIONS,
  USER_ORDER_STAGE,
  getUserOrderStageText,
  getUserOrderStageTagType,
  getUserOrderStatusText,
  getUserOrderStatusTagType,
  getSettlementStatusText,
  getSettlementStatusTagType,
  getDeliveryStatusText,
  getDeliveryStatusTagType,
  DELIVERY_STATUS
} from '@/constants/userOrder'

const BASE_API = (import.meta.env.VITE_BASE_API || '/api').replace(/\/+$/, '')
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export default {
  name: 'UserOrderList',
  components: {
    ImageUploader,
    FileUploader
  },
  data() {
    return {
      loading: false,
      DELIVERY_STATUS, // 交付状态枚举
      USER_ORDER_STAGE, // 订单阶段枚举

      // 搜索表单
      searchForm: {
        no: '',
        stage: '',
        status: '',
        contractNo: '',
        contractName: '',
        contractPartnerName: '',
        partyAName: '',
        partyBName: '',
        processorName: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },

      // 订单状态阶段选项
      stageOptions: USER_ORDER_STAGE_OPTIONS,

      // 订单状态选项
      statusOptions: USER_ORDER_STATUS_OPTIONS,

      // 结算对话框
      settlementDialogVisible: false,
      settlementSubmitLoading: false,
      settlementForm: {
        otherAdjustAmount: 0
      },
      settlementRules: {
        otherAdjustAmount: [
          { required: true, message: '请输入其他调价金额', trigger: 'blur' }
        ]
      },

      // 补充材料对话框
      supplementDialogVisible: false,
      supplementSubmitLoading: false,
      supplementForm: {
        settlementPdf: '',
        applicationPdf: '',
        deliveryPdf: ''
      },
      supplementRules: {
        settlementPdf: [
          { required: true, message: '请上传结算单PDF', trigger: 'change' }
        ],
        applicationPdf: [
          { required: true, message: '请上传申请单PDF', trigger: 'change' }
        ],
        deliveryPdf: [
          { required: true, message: '请上传交付单PDF', trigger: 'change' }
        ]
      },

      // 交付对话框
      deliveryDialogVisible: false,
      viewDeliveryDialogVisible: false, // 新增：查看交付对话框显示状态
      deliveryStep: 1, // 1: 选择模式, 2: 填写信息
      deliveryMethod: '', // online/offline
      deliverySubmitLoading: false,
      deliveryViewMode: false, // 是否为查看模式 (deprecated for view, but can be kept for compatibility if needed inside shared logic, generally we separate it now)
      currentOrder: {},

      // 线上交付表单
      deliveryOnlineForm: {
        deliveryTime: '',
        deliveryPhoto: '',
        partnerSignature: '',
        processorSignature: ''
      },
      deliveryOnlineRules: {
        deliveryTime: [
          { required: true, message: '请选择交付时间', trigger: 'change' }
        ],
        deliveryPhoto: [
          { required: true, message: '请上传交付照片', trigger: 'change' }
        ],
        partnerSignature: [
          { required: true, message: '请上传合作方签字', trigger: 'change' }
        ],
        processorSignature: [
          { required: true, message: '请上传司机签字', trigger: 'change' }
        ]
      },

      // 线下交付表单
      deliveryOfflineForm: {
        deliveryPDF: ''
      },
      deliveryOfflineRules: {
        deliveryPDF: [
          {
            required: true,
            message: '请上传交付单',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (!value || value === '') {
                callback(new Error('请上传交付单'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    // 获取列表数据
    async fetchList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.page,
          pageSize: this.pagination.size
        }
        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key]
          }
        })
        const response = await getUserOrderListPage(params)
        if (response && response.data) {
          this.tableData = response.data.records || response.data.list || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取用户订单列表失败:', error)
        this.$message.error('获取用户订单列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        no: '',
        stage: '',
        status: '',
        contractNo: '',
        contractName: '',
        contractPartnerName: '',
        partyAName: '',
        partyBName: '',
        processorName: ''
      }
      this.pagination.page = 1
      this.fetchList()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchList()
    },

    // 页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchList()
    },

    // 编辑订单
    handleEdit(row) {
      this.$router.push({
        name: 'UserOrderAdd',
        query: { id: row.id }
      })
    },

    // 登记信息（统一入口）
    handleRegisterInfo(row) {
      this.$router.push({
        name: 'UserOrderRegister',
        query: { id: row.id }
      })
    },

    // 删除订单
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteUserOrder(row.id)
        this.$message.success('删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除订单失败:', error)
          this.$message.error('删除订单失败')
        }
      }
    },

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

    // 获取结算状态文本
    getSettlementStatusText(status) {
      return getSettlementStatusText(status)
    },

    // 获取结算状态标签类型
    getSettlementStatusTagType(status) {
      return getSettlementStatusTagType(status)
    },

    // 获取交付状态文本
    getDeliveryStatusText(status) {
      return getDeliveryStatusText(status)
    },

    // 获取交付状态标签类型
    getDeliveryStatusTagType(status) {
      return getDeliveryStatusTagType(status)
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
    },

    // 添加订单
    handleAdd() {
      this.$router.push({ name: 'UserOrderAdd' })
    },

    // 更多操作
    handleMoreAction(command, row) {
      if (command === 'previewSettlement') {
        this.handlePreviewSettlement(row)
      } else {
        const actions = {
          previewApplication: '预览申请单',
          previewDelivery: '预览交付单'
        }
        this.$message.info(`${actions[command]}功能未开发`)
      }
    },

    // 预览结算单
    handlePreviewSettlement(row) {
      this.$router.push({
        path: `/order/settlement/${row.id}`,
        query: {
          type: 'userOrder'
        }
      })
    },

    // 确认结算
    handleSettle(row) {
      this.currentOrder = row
      this.settlementForm.otherAdjustAmount = row.otherAdjustAmount || 0
      this.settlementDialogVisible = true
    },

    // 关闭结算对话框
    handleSettlementDialogClose() {
      this.settlementForm = {
        otherAdjustAmount: 0
      }
      if (this.$refs.settlementForm) {
        this.$refs.settlementForm.clearValidate()
      }
    },

    // 提交结算
    async handleSettlementSubmit() {
      if (!this.$refs.settlementForm) return

      this.$refs.settlementForm.validate(async(valid) => {
        if (!valid) return false

        this.settlementSubmitLoading = true
        try {
          await confirmSettlement({
            id: this.currentOrder.id,
            otherAdjustAmount: this.settlementForm.otherAdjustAmount
          })
          this.$message.success('结算成功')
          this.settlementDialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('结算失败:', error)
          this.$message.error('结算失败')
        } finally {
          this.settlementSubmitLoading = false
        }
      })
    },

    // 补充材料
    handleSupplementMaterials(row) {
      this.currentOrder = row
      this.supplementForm = {
        settlementPdf: row.settlementPdf || '',
        applicationPdf: row.applicationPdf || '',
        deliveryPdf: row.deliveryPdf || ''
      }
      this.supplementDialogVisible = true
    },

    // 关闭补充材料对话框
    handleSupplementDialogClose() {
      this.supplementForm = {
        settlementPdf: '',
        applicationPdf: '',
        deliveryPdf: ''
      }
      if (this.$refs.supplementForm) {
        this.$refs.supplementForm.clearValidate()
      }
    },

    handleFileChange(field) {
      if (this.$refs.supplementForm) {
        this.$refs.supplementForm.validateField(field)
      }
    },

    // 提交补充材料
    async handleSupplementSubmit() {
      if (!this.$refs.supplementForm) return

      this.$refs.supplementForm.validate(async(valid) => {
        if (!valid) return false

        this.supplementSubmitLoading = true
        try {
          const payload = {
            orderId: this.currentOrder.id,
            settlementPdf: this.supplementForm.settlementPdf,
            applicationPdf: this.supplementForm.applicationPdf,
            deliveryPdf: this.supplementForm.deliveryPdf
          }
          await saveOrderMaterials(payload)
          this.$message.success('补充材料提交成功')
          this.supplementDialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('补充材料提交失败:', error)
          this.$message.error('补充材料提交失败')
        } finally {
          this.supplementSubmitLoading = false
        }
      })
    },

    // 交付订单
    handleDelivery(row) {
      this.currentOrder = row
      this.deliveryViewMode = false
      this.deliveryDialogVisible = true
    },

    // 查看交付
    handleViewDelivery(row) {
      this.currentOrder = row
      // this.deliveryViewMode = true // No longer using the shared dialog for viewing
      this.deliveryMethod = row.deliveryMethod || ''

      // 根据交付方式显示对应的交付信息
      if (row.deliveryMethod === 'online') {
        // 线上交付：显示交付时间、交付照片、合作方签字、经办人签字
        this.deliveryOnlineForm = {
          deliveryTime: row.deliveryTime || '',
          deliveryPhoto: row.deliveryPhoto || '',
          partnerSignature: row.partnerSignature || '',
          processorSignature: row.processorSignature || ''
        }
      } else if (row.deliveryMethod === 'offline') {
        // 线下交付：显示交付单PDF
        this.deliveryOfflineForm = {
          deliveryPDF: row.deliveryPdf || row.deliveryPDF || ''
        }
      }

      this.viewDeliveryDialogVisible = true
    },

    // 关闭查看交付对话框
    handleViewDeliveryDialogClose() {
      this.viewDeliveryDialogVisible = false
      this.deliveryMethod = ''
      this.deliveryOnlineForm = {
        deliveryTime: '',
        deliveryPhoto: '',
        partnerSignature: '',
        processorSignature: ''
      }
      this.deliveryOfflineForm = {
        deliveryPDF: ''
      }
    },

    // 查看PDF文件
    handleViewPdf(url) {
      if (!url) {
        this.$message.warning('暂无文件')
        return
      }
      window.open(this.displayUrl(url), '_blank', 'noopener')
    },

    // 进入下一步
    handleNextStep() {
      this.deliveryStep = 2
    },

    // 关闭交付对话框
    handleDeliveryDialogClose() {
      this.deliveryStep = 1
      this.deliveryMethod = ''
      this.deliveryViewMode = false
      this.deliveryOnlineForm = {
        deliveryTime: '',
        deliveryPhoto: '',
        partnerSignature: '',
        processorSignature: ''
      }
      this.deliveryOfflineForm = {
        deliveryPDF: ''
      }

      if (this.$refs.deliveryOnlineForm) {
        this.$refs.deliveryOnlineForm.clearValidate()
      }
      if (this.$refs.deliveryOfflineForm) {
        this.$refs.deliveryOfflineForm.clearValidate()
      }
    },

    // 交付单文件变化
    handleDeliveryPDFChange() {
      if (this.$refs.deliveryOfflineForm) {
        this.$refs.deliveryOfflineForm.validateField('deliveryPDF')
      }
    },

    // 提交交付
    async handleDeliverySubmit() {
      const formRef = this.deliveryMethod === 'online' ? 'deliveryOnlineForm' : 'deliveryOfflineForm'

      if (!this.$refs[formRef]) return

      this.$refs[formRef].validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.deliverySubmitLoading = true
        try {
          const deliveryData = {
            orderId: this.currentOrder.id,
            deliveryMethod: this.deliveryMethod
          }

          if (this.deliveryMethod === 'online') {
            deliveryData.deliveryTime = this.deliveryOnlineForm.deliveryTime
            deliveryData.deliveryPhoto = this.deliveryOnlineForm.deliveryPhoto
            deliveryData.partnerSignature = this.deliveryOnlineForm.partnerSignature
            deliveryData.processorSignature = this.deliveryOnlineForm.processorSignature
          } else {
            deliveryData.deliveryPDF = this.deliveryOfflineForm.deliveryPDF
            console.log('提交线下交付数据:', deliveryData)
          }

          await submitDelivery(deliveryData)
          this.$message.success('交付成功')
          this.deliveryDialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('交付失败:', error)
          this.$message.error('交付失败')
        } finally {
          this.deliverySubmitLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
