<template>
  <div class="invoice-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.invoiceNo" placeholder="发票号码" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.processor" placeholder="经办人" style="width: 200px; margin-right: 10px;" />
        <el-select v-model="search.status" placeholder="状态" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="已开票" value="invoiced" />
          <el-option label="待开票" value="pending" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增发票</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="invoiceNo" label="发票号码" width="180" />
        <el-table-column prop="processor" label="经办人" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="scope">
            ¥{{ formatAmount(scope.row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="plannedInvoiceTime" label="计划开票日期" width="150" />
        <el-table-column prop="invoiceType" label="发票类型" width="120" />
        <el-table-column prop="invoiceBank" label="开票银行" width="150" />
        <el-table-column prop="invoiceTime" label="开票日期" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'invoiced' ? 'success' : 'info'">{{ scope.row.status === 'invoiced' ? '已开票' : '待开票' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.status !== 'invoiced'"
              size="mini"
              type="success"
              @click="handleConfirm(scope.row)"
            >
              确认
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="page"
          @current-change="fetchList"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="1000px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="发票号码" prop="invoiceNo">
                <el-input v-model="form.invoiceNo" placeholder="请输入发票号码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联订单" prop="orderId">
                <el-input
                  v-model="form.orderId"
                  placeholder="请选择关联订单"
                  readonly
                  @focus="openOrderSelector"
                >
                  <template #append>
                    <el-button icon="el-icon-search" @click="openOrderSelector">选择订单</el-button>
                  </template>
                </el-input>

              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="订单类型" prop="orderType">
                <el-input v-model="form.orderType" placeholder="订单类型" readonly />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="发票类型" prop="invoiceType">
                <el-select v-model="form.invoiceType" placeholder="请选择发票类型" style="width: 100%;">
                  <el-option label="进项" value="进项" />
                  <el-option label="销项" value="销项" />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="合作方" prop="partner">
                <el-input v-model="form.partner" placeholder="合作方" readonly />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="开票银行" prop="invoiceBank">
                <el-input
                  v-model="form.invoiceBank"
                  placeholder="请先选择订单，再选择开票银行"
                  readonly
                  :disabled="!form.orderId"
                  @focus="openBankSelector"
                >
                  <template #append>
                    <el-button
                      icon="el-icon-search"
                      :disabled="!form.orderId"
                      @click="openBankSelector"
                    >
                      选择银行
                    </el-button>
                  </template>
                </el-input>

              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划开票时间" prop="plannedInvoiceTime">
                <el-date-picker
                  v-model="form.plannedInvoiceTime"
                  type="datetime"
                  placeholder="选择计划开票时间"
                  style="width: 100%;"
                  value-format="yyyy-MM-dd HH:mm:ss"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 确认开票信息 -->
        <el-divider content-position="left">确认开票信息</el-divider>
        <div class="form-section">
          <div class="disabled-section">
            <el-alert
              title="确认开票信息只能通过'确认发票'功能进行更新"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 16px;"
            />
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="经办人">
                  <el-input v-model="form.processor" placeholder="经办人" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发票编号">
                  <el-input v-model="form.invoiceNumber" placeholder="发票编号" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开票时间">
                  <el-input v-model="form.invoiceTime" placeholder="开票时间" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="总金额">
                  <el-input :value="formatAmount(form.totalAmount)" placeholder="总金额" disabled>
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="税额">
                  <el-input :value="formatAmount(form.taxAmount)" placeholder="税额" disabled>
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="不含税金额">
                  <el-input :value="formatAmount(form.amountWithoutTax)" placeholder="不含税金额" disabled>
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 发票明细 -->
        <el-divider content-position="left">发票明细</el-divider>
        <div class="form-section">
          <!-- 合计行 -->
          <div class="summary-row">
            <el-row :gutter="16">
              <el-col :span="6">
                <span class="summary-label">合计订单总金额：</span>
                <span class="summary-value">¥{{ formatAmount(totalOrderAmount) }}</span>
              </el-col>
              <el-col :span="6">
                <span class="summary-label">合计实开发票：</span>
                <span class="summary-value">¥{{ formatAmount(totalActualInvoice) }}</span>
              </el-col>
              <el-col :span="6">
                <span class="summary-label">合计应开发票：</span>
                <span class="summary-value">¥{{ formatAmount(totalShouldInvoice) }}</span>
              </el-col>
              <!-- <el-col :span="6">
                <el-button type="primary" size="small" @click="addDetail">添加明细</el-button>
              </el-col> -->
            </el-row>
          </div>

          <el-table :data="form.details" border style="width: 100%; margin-top: 10px;">
            <el-table-column prop="orderNo" label="订单编号" width="180" />
            <el-table-column prop="orderType" label="订单类型" width="120">
              <template #default="scope">
                {{ getOrderTypeText(scope.row.orderType) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderPartnerName" label="合作方" width="150" show-overflow-tooltip />
            <el-table-column prop="orderTotalAmount" label="订单总金额" width="140">
              <template #default="scope">
                ¥{{ formatAmount(scope.row.orderTotalAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderActualInvoice" label="订单实开发票" width="140">
              <template #default="scope">
                ¥{{ formatAmount(scope.row.orderActualInvoice) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderShouldInvoice" label="订单应开发票" width="140">
              <template #default="scope">
                ¥{{ formatAmount(scope.row.orderShouldInvoice) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 订单选择器 -->
    <order-selector
      v-model:visible="orderSelectorVisible"
      title="选择关联订单"
      :multiple="false"
      :selected-orders="selectedOrders"
      :show-flow-direction="false"
      :filters="orderFilters"
      @confirm="handleOrderConfirm"
      @cancel="handleOrderCancel"
    />

    <!-- 银行选择器 -->
    <bank-info-selector
      v-model:visible="bankSelectorVisible"
      title="选择开票银行"
      :multiple="false"
      :filters="bankFilters"
      :filter-account-id="selectedOrderPartnerId"
      @confirm="handleBankConfirm"
      @cancel="handleBankCancel"
    />

    <!-- 确认发票弹窗 -->
    <el-dialog title="确认发票" v-model="confirmDialogVisible" width="1000px">
      <el-form ref="confirmForm" :model="confirmForm" :rules="confirmRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="经办人" prop="processor">
              <el-input
                v-model="confirmForm.processor"
                placeholder="请选择经办人"
                readonly
                @focus="openAdminUserSelector"
              >
                <template #append>
                  <el-button icon="el-icon-search" @click="openAdminUserSelector">选择经办人</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票时间" prop="invoiceTime">
              <el-date-picker
                v-model="confirmForm.invoiceTime"
                type="datetime"
                placeholder="选择开票时间"
                style="width: 100%;"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总金额" prop="totalAmount">
              <el-input-number
                v-model="confirmForm.totalAmount"
                :min="0"
                :precision="2"
                style="width: 100%;"
                placeholder="请输入总金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税额" prop="taxAmount">
              <el-input-number
                v-model="confirmForm.taxAmount"
                :min="0"
                :precision="2"
                style="width: 100%;"
                placeholder="请输入税额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="不含税金额">
              <el-input
                :value="formatAmount(calculatedAmountWithoutTax)"
                placeholder="不含税金额"
                readonly
              >
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmSubmit">确 认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 后台用户选择器 -->
    <admin-user-selector
      v-model:visible="adminUserSelectorVisible"
      title="选择经办人"
      :multiple="false"
      @confirm="handleAdminUserConfirm"
      @cancel="handleAdminUserCancel"
    />
  </div>
</template>

<script>
import OrderSelector from '@/components/OrderSelector'
import BankInfoSelector from '@/components/BankInfoSelector'
import AdminUserSelector from '@/components/AdminUserSelector'
import { getInvoicePage, getInvoiceDetail, createInvoice, updateInvoice, deleteInvoice, confirmInvoice } from '@/api/invoice'

export default {
  name: 'InvoiceList',
  components: {
    OrderSelector,
    BankInfoSelector,
    AdminUserSelector
  },
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        invoiceNo: '',
        processor: '',
        status: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        invoiceNo: '',
        orderId: '',
        orderType: '',
        invoiceType: '',
        partner: '',
        invoiceBank: '',
        plannedInvoiceTime: '',
        // 确认开票信息
        processor: '',
        processorId: null,
        invoiceNumber: '',
        invoiceTime: '',
        totalAmount: 0,
        taxAmount: 0,
        amountWithoutTax: 0,
        details: []
      },
      rules: {
        invoiceNo: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
        orderId: [{ required: true, message: '请选择关联订单', trigger: 'blur' }],
        invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
        invoiceBank: [{ required: true, message: '请选择开票银行', trigger: 'blur' }],
        plannedInvoiceTime: [{ required: true, message: '请选择计划开票时间', trigger: 'change' }]
      },
      orderSelectorVisible: false,
      selectedOrders: [],
      selectedOrderInfo: null,
      orderFilters: {},
      // 银行选择器相关
      bankSelectorVisible: false,
      selectedBankInfo: null,
      selectedOrderPartnerId: null,
      bankFilters: {},
      // 确认弹窗相关数据
      confirmDialogVisible: false,
      confirmForm: {
        id: null,
        processor: '',
        processorId: null,
        invoiceTime: '',
        totalAmount: 0,
        taxAmount: 0,
        amountWithoutTax: 0
      },
      // 后台用户选择器相关
      adminUserSelectorVisible: false,
      selectedAdminUserInfo: null,
      confirmRules: {
        processor: [{ required: true, message: '请选择经办人', trigger: 'blur' }],
        invoiceTime: [{ required: true, message: '请选择开票时间', trigger: 'change' }],
        totalAmount: [{ required: true, message: '请输入总金额', trigger: 'blur' }],
        taxAmount: [{ required: true, message: '请输入税额', trigger: 'blur' }]
      }
    }
  },
  computed: {
    totalOrderAmount() {
      return this.form.details.reduce((sum, detail) => sum + (Number(detail.orderTotalAmount) || 0), 0)
    },
    totalActualInvoice() {
      return this.form.details.reduce((sum, detail) => sum + (Number(detail.orderActualInvoice) || 0), 0)
    },
    totalShouldInvoice() {
      return this.form.details.reduce((sum, detail) => sum + (Number(detail.orderShouldInvoice) || 0), 0)
    },
    calculatedAmountWithoutTax() {
      const totalAmount = Number(this.confirmForm.totalAmount) || 0
      const taxAmount = Number(this.confirmForm.taxAmount) || 0
      return totalAmount - taxAmount
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.page,
          pageSize: this.pageSize,
          ...this.search
        }

        // 过滤空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getInvoicePage(params)
        if (response && response.data) {
          this.list = response.data.records || []
          this.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取发票列表失败:', error)
        this.$message.error('获取发票列表失败')
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.dialogTitle = '新增发票'
      this.form = {
        id: null,
        invoiceNo: '',
        orderId: '',
        orderType: '',
        invoiceType: '',
        partner: '',
        invoiceBank: '',
        plannedInvoiceTime: '',
        // 确认开票信息
        processor: '',
        processorId: null,
        invoiceNumber: '',
        invoiceTime: '',
        totalAmount: 0,
        taxAmount: 0,
        amountWithoutTax: 0,
        details: []
      }
      this.selectedOrderInfo = null
      this.selectedOrders = []
      this.selectedBankInfo = null
      this.selectedOrderPartnerId = null
      this.dialogVisible = true
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑发票'

      // 重置选择器状态
      this.selectedOrderInfo = null
      this.selectedOrders = []
      this.selectedBankInfo = null
      this.selectedOrderPartnerId = null

      try {
        // 获取发票详情
        const response = await getInvoiceDetail(row.id)
        if (response && response.data) {
          // 根据后端返回的数据结构，invoice和details是分开的
          const invoiceData = response.data.invoice || {}
          const detailsData = response.data.details || []

          // 设置表单数据
          this.form = {
            id: invoiceData.id,
            invoiceNo: invoiceData.invoiceNo || '',
            orderId: invoiceData.orderId || '',
            orderType: invoiceData.orderType || '',
            invoiceType: invoiceData.invoiceType || '',
            partner: invoiceData.partner || '',
            invoiceBank: invoiceData.invoiceBank || '',
            plannedInvoiceTime: invoiceData.plannedInvoiceTime || '',
            // 确认开票信息
            processor: invoiceData.processor || '',
            processorId: invoiceData.processorId || null,
            invoiceNumber: invoiceData.invoiceNumber || '',
            invoiceTime: invoiceData.invoiceTime || '',
            totalAmount: invoiceData.totalAmount || 0,
            taxAmount: invoiceData.taxAmount || 0,
            amountWithoutTax: invoiceData.amountWithoutTax || 0,
            details: detailsData
          }
          // 取明细中的第一条作为订单信息
          const orderDetail = detailsData[0]
          this.form.orderId = orderDetail.orderId
          this.form.partnerId = orderDetail.orderPartner

          // 设置选中的订单信息用于显示
          if (this.form.orderId) {
            this.selectedOrderInfo = {
              id: orderDetail.orderId,
              no: orderDetail.orderNo || '',
              contractName: orderDetail.contractName || '',
              type: orderDetail.orderType
            }
            this.selectedOrders = [this.selectedOrderInfo]
            this.selectedOrderPartnerId = orderDetail.orderPartner || null
          }

          // 设置选中的银行信息用于显示
          if (this.form.invoiceBank) {
            this.selectedBankInfo = {
              id: invoiceData.bankId || null,
              bankName: this.form.invoiceBank,
              cardNumber: invoiceData.bankCardNumber || '',
              bankCode: invoiceData.bankCode || ''
            }
          }
        }
        console.log('编辑表单数据:', this.form)
        this.dialogVisible = true
      } catch (error) {
        console.error('获取发票详情失败:', error)
        this.$message.error('获取发票详情失败')
        // 如果获取详情失败，使用列表数据
        this.form = { ...row }
        this.dialogVisible = true
      }
    },
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },
    openOrderSelector() {
      // 重置选择状态
      this.selectedOrders = []
      this.orderFilters = {
        status: 'completed' // 只显示已结算的订单
      }
      this.orderSelectorVisible = true
    },
    handleOrderConfirm(selectedOrders) {
      if (!selectedOrders || selectedOrders.length === 0) {
        this.$message.warning('请选择一个订单')
        return
      }

      const order = selectedOrders[0]
      if (!order) return

      // 填充表单数据
      this.form.orderId = order.id || ''
      this.form.orderType = this.getOrderTypeText(order.type) || ''
      this.form.partner = order.contractPartnerName || ''

      // 保存选中的订单信息用于显示
      this.selectedOrderInfo = {
        id: order.id,
        no: order.no,
        contractName: order.contractName,
        type: order.type
      }

      // 设置合作方ID用于银行过滤
      this.selectedOrderPartnerId = order.contractPartner || null

      // 清空之前选择的银行信息
      this.selectedBankInfo = null
      this.form.invoiceBank = ''

      // 自动添加订单明细
      this.addOrderDetail(order)
    },
    handleOrderCancel() {
      this.orderSelectorVisible = false
    },
    // 添加订单明细
    addOrderDetail(order) {
      const detail = {
        orderId: order.id || '',
        orderNo: order.no || '',
        orderType: order.type || '',
        orderPartner: order.contractPartner || '',
        orderPartnerName: order.contractPartnerName || '',
        orderTotalAmount: Number(order.totalAmount) || 0,
        orderActualInvoice: 0,
        orderShouldInvoice: Number(order.totalAmount) || 0
      }

      // 检查是否已存在相同订单
      const existingIndex = this.form.details.findIndex(d => d.orderNo === detail.orderNo)
      if (existingIndex >= 0) {
        this.$message.warning('该订单已存在，请勿重复添加')
        return
      }

      this.form.details.push(detail)
    },
    // 获取订单类型文本
    getOrderTypeText(type) {
      const typeMap = {
        'purchase': '采购订单',
        'transport': '运输订单',
        'process': '加工订单',
        'sales': '销售订单',
        'storage': '仓储订单',
        'other': '其他订单'
      }
      return typeMap[type] || '未知类型'
    },

    // 打开银行选择器
    openBankSelector() {
      if (!this.form.orderId) {
        this.$message.warning('请先选择订单')
        return
      }

      if (!this.selectedOrderPartnerId) {
        this.$message.warning('所选订单缺少合作方信息，无法选择银行')
        return
      }

      this.bankFilters = {
        // 可以添加其他过滤条件
      }
      this.bankSelectorVisible = true
    },

    // 银行选择确认
    handleBankConfirm(selectedBanks) {
      if (!selectedBanks || selectedBanks.length === 0) {
        this.$message.warning('请选择一个银行')
        return
      }

      const bank = selectedBanks[0]
      if (!bank) return

      // 填充银行信息
      this.form.invoiceBank = bank.bankName
      this.selectedBankInfo = {
        id: bank.id,
        bankName: bank.bankName,
        cardNumber: bank.cardNumber,
        bankCode: bank.bankCode
      }

      this.$message.success('银行选择成功')
    },

    // 银行选择取消
    handleBankCancel() {
      this.$message.info('已取消选择银行')
    },

    // 打开后台用户选择器
    openAdminUserSelector() {
      this.adminUserSelectorVisible = true
    },

    // 后台用户选择确认
    handleAdminUserConfirm(selectedUsers) {
      if (!selectedUsers || selectedUsers.length === 0) {
        this.$message.warning('请选择一个后台用户')
        return
      }

      const adminUser = selectedUsers[0]
      if (!adminUser) return

      // 填充经办人信息
      this.confirmForm.processor = adminUser.nickname
      this.confirmForm.processorId = adminUser.id
      this.selectedAdminUserInfo = {
        id: adminUser.id,
        username: adminUser.username,
        nickname: adminUser.nickname,
        phone: adminUser.phone
      }

      this.$message.success('经办人选择成功')
    },

    // 后台用户选择取消
    handleAdminUserCancel() {
      this.$message.info('已取消选择经办人')
    },
    addDetail() {
      this.form.details.push({
        orderNo: '',
        orderType: '',
        orderPartnerName: '',
        orderTotalAmount: 0,
        orderActualInvoice: 0,
        orderShouldInvoice: 0
      })
    },
    removeDetail(index) {
      this.form.details.splice(index, 1)
    },
    handleConfirm(row) {
      console.log('确认发票行数据:', row)
      this.confirmForm = {
        id: row.id,
        processor: row.processor || '',
        processorId: row.processorId || null,
        invoiceTime: '',
        totalAmount: 0,
        taxAmount: 0,
        amountWithoutTax: 0
      }
      console.log('设置确认表单数据:', this.confirmForm)

      // 如果已有经办人信息，设置选中状态
      if (row.processor) {
        this.selectedAdminUserInfo = {
          id: row.processorId,
          username: row.processorUsername || '',
          nickname: row.processor,
          phone: row.processorPhone || ''
        }
      } else {
        this.selectedAdminUserInfo = null
      }

      this.confirmDialogVisible = true
    },
    async handleConfirmSubmit() {
      try {
        await this.$refs.confirmForm.validate()

        const confirmData = {
          invoiceId: this.confirmForm.id,
          processor: this.confirmForm.processor,
          processorId: this.confirmForm.processorId,
          invoiceTime: this.confirmForm.invoiceTime,
          totalAmount: this.confirmForm.totalAmount,
          taxAmount: this.confirmForm.taxAmount,
          amountWithoutTax: this.calculatedAmountWithoutTax
        }

        console.log('确认发票数据:', confirmData)
        await confirmInvoice(confirmData)
        this.$message.success('确认发票成功')
        this.confirmDialogVisible = false
        this.fetchList()
      } catch (error) {
        console.error('确认发票失败:', error)
        this.$message.error('确认发票失败')
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该发票吗？', '提示', { type: 'warning' })
        await deleteInvoice(row.id)
        this.$message.success('删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除发票失败:', error)
          this.$message.error('删除发票失败')
        }
      }
    },
    async handleSave() {
      try {
        // 验证表单
        await this.$refs.form.validate()

        // 计算总金额
        this.form.totalAmount = this.totalOrderAmount

        // 构建API数据
        const apiData = {
          invoice: {
            id: this.form.id,
            invoiceNo: this.form.invoiceNo,
            invoiceType: this.form.invoiceType,
            invoiceBank: this.form.invoiceBank,
            plannedInvoiceTime: this.form.plannedInvoiceTime,
            processor: this.form.processor,
            totalAmount: this.form.totalAmount,
            taxAmount: this.form.taxAmount,
            amountWithoutTax: this.form.amountWithoutTax
          },
          details: this.form.details.map(detail => ({
            orderId: detail.orderId,
            orderType: detail.orderType,
            orderPartner: detail.orderPartner,
            orderPartnerName: detail.orderPartnerName,
            orderTotalAmount: detail.orderTotalAmount,
            orderActualInvoice: detail.orderActualInvoice,
            orderShouldInvoice: detail.orderShouldInvoice
          }))
        }

        if (this.form.id) {
          // 更新发票
          await updateInvoice(apiData)
          this.$message.success('更新发票成功')
        } else {
          // 创建发票
          await createInvoice(apiData)
          this.$message.success('创建发票成功')
        }

        this.dialogVisible = false
        this.fetchList()
      } catch (error) {
        console.error('保存发票失败:', error)
        this.$message.error('保存发票失败')
      }
    }
  }
}
</script>

<style scoped>
.invoice-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}

.form-section {
  margin-bottom: 20px;
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

.summary-row {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.summary-label {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
}

.summary-value {
  font-weight: 600;
  color: #409EFF;
  font-size: 16px;
}

.selected-order-info {
  margin-top: 8px;

  .el-tag {
    margin-right: 8px;
  }
}

.selected-bank-info {
  margin-top: 8px;

  .el-tag {
    margin-right: 8px;
  }
}

.selected-admin-user-info {
  margin-top: 8px;

  .el-tag {
    margin-right: 8px;
  }
}

.disabled-section {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;

  .el-input.is-disabled .el-input__inner {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #909399;
  }
}
</style>
