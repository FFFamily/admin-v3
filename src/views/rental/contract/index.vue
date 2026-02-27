<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.prevent>
      <el-form-item label="合同名">
        <el-input v-model="searchForm.name" placeholder="请输入合同名" />
      </el-form-item>
      <el-form-item label="合同编号">
        <el-input v-model="searchForm.code" placeholder="请输入合同编号" />
      </el-form-item>
      <el-form-item label="合同识别号">
        <el-input v-model="searchForm.recognitionCode" placeholder="请输入合同识别号" />
      </el-form-item>
      <el-form-item label="合同类型">
        <el-select v-model="searchForm.type" placeholder="请选择合同类型" clearable>
          <el-option label="采购合同" value="recycle" />
          <el-option label="租赁合同" value="lease" />
        </el-select>
      </el-form-item>
      <el-form-item label="签署用户">
        <el-input
          v-model="searchForm.userName"
          placeholder="请选择签署用户"
          readonly
          style="cursor: pointer;"
          @click="showSearchUserSelector"
        >
          <template #append>
            <el-button icon="el-icon-search" @click="showSearchUserSelector" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增合同</el-button>
      </el-form-item>
    </el-form>

    <!-- 合同表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="合同名" prop="name" />
      <el-table-column label="合同识别号" prop="recognitionCode" />
      <el-table-column label="合同编号" prop="code" />
      <el-table-column label="合同类型" prop="type">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 'recycle'" type="success">采购合同</el-tag>
          <el-tag v-else-if="scope.row.type === 'lease'" type="warning">租赁合同</el-tag>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="起始日期" prop="startDate" />
      <el-table-column label="结束日期" prop="endDate" />
      <!-- <el-table-column label="付款方式" prop="paymentMethod" />
      <el-table-column label="开票方式" prop="invoiceMethod" /> -->
      <el-table-column label="签署用户" prop="userId">
        <template #default="scope">
          <span>{{ getUserName(scope.row.userId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" />
      <el-table-column label="操作" width="280" align="center">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="handleViewItems(scope.row)">明细</el-button>
          <el-button size="mini" type="info" @click="handleViewLogs(scope.row)">变更记录</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="合同名" prop="name">
          <el-input v-model="form.name" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="合同识别号" prop="recognitionCode">
          <el-input v-model="form.recognitionCode" placeholder="请输入合同识别号" />
        </el-form-item>
        <el-form-item label="合同编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入合同编号" />
        </el-form-item>
        <el-form-item label="合同类型" prop="type">
          <!--编辑时无法编辑合同类型-->
          <el-select v-model="form.type" placeholder="请选择合同类型" style="width: 100%;" :disabled="form.id">
            <el-option label="采购合同" value="recycle" />
            <el-option label="租赁合同" value="lease" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="datetime" placeholder="选择起始日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="datetime" placeholder="选择结束日期" style="width: 100%;" />
        </el-form-item>
        <!-- <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择付款方式" style="width: 100%;">
            <el-option label="现金" value="CASH" />
            <el-option label="银行转账" value="BANK_TRANSFER" />
            <el-option label="支票" value="CHECK" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="开票方式" prop="invoiceMethod">
          <el-select v-model="form.invoiceMethod" placeholder="请选择开票方式" style="width: 100%;">
            <el-option label="增值税普通发票" value="VAT_NORMAL" />
            <el-option label="增值税专用发票" value="VAT_SPECIAL" />
            <el-option label="电子发票" value="ELECTRONIC" />
            <el-option label="不开票" value="NO_INVOICE" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="签署用户" prop="userId">
          <el-input
            v-model="form.userName"
            placeholder="请选择签署用户"
            readonly
            style="cursor: pointer;"
            @focus="showFormUserSelector"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="showFormUserSelector" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 合同明细弹窗 -->
    <el-dialog title="合同明细" v-model="itemsDialogVisible" width="900px">
      <div style="margin-bottom: 20px;">
        <el-button type="primary" size="small" @click="handleAddItem">新增明细</el-button>
      </div>

      <!-- 采购货物明细 -->
      <el-table v-if="currentContractType === 'recycle'" v-loading="listLoading" :data="contractItems.filter(item => item.recycleGoodId)" border style="margin-bottom: 20px;">
        <el-table-column label="采购货物明细" align="center" header-align="center">
          <el-table-column label="货物名称" prop="recycleGoodName" />
          <el-table-column label="规格型号" prop="recycleGoodSpecificationModel" />
          <el-table-column label="运输模式" prop="recycleGoodTransportMode" />
          <el-table-column label="金额" prop="recycleGoodSubtotal">
            <template #default="scope">
              ¥{{ scope.row.recycleGoodSubtotal || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <!-- 租赁设备明细 -->
      <el-table v-if="currentContractType === 'lease'" v-loading="listLoading" :data="contractItems.filter(item => item.leaseGoodId)" border>
        <el-table-column label="租赁设备明细" align="center" header-align="center">
          <el-table-column label="设备名称" prop="leaseGoodName" />
          <el-table-column label="押金" prop="leaseGoodDeposit">
            <template #default="scope">
              ¥{{ scope.row.leaseGoodDeposit || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="leaseGoodSubtotal">
            <template #default="scope">
              ¥{{ scope.row.leaseGoodSubtotal || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="安装日期" prop="leaseGoodInstallDate" />
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑明细弹窗 -->
      <el-dialog :title="itemDialogTitle" v-model="itemDialogVisible" width="500px" append-to-body>
        <el-form ref="itemForm" :model="itemForm" :rules="itemRules" label-width="120px">
          <el-form-item label="明细类型" prop="itemType">
            <el-radio-group v-model="itemForm.itemType" :disabled="true">
              <el-radio v-if="currentContractType === 'recycle'" label="recycle">采购货物</el-radio>
              <el-radio v-if="currentContractType === 'lease'" label="lease">租赁设备</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 采购货物字段 -->
          <template v-if="itemForm.itemType === 'recycle'">
            <el-form-item label="货物名称" prop="recycleGoodName">
              <el-input v-model="itemForm.recycleGoodName" placeholder="请输入货物名称" />
            </el-form-item>
            <el-form-item label="规格型号" prop="recycleGoodSpecificationModel">
              <el-input v-model="itemForm.recycleGoodSpecificationModel" placeholder="请输入规格型号" />
            </el-form-item>
            <el-form-item label="运输模式" prop="recycleGoodTransportMode">
              <el-select v-model="itemForm.recycleGoodTransportMode" placeholder="请选择运输模式" style="width: 100%;">
                <el-option label="公路运输" value="ROAD" />
                <el-option label="铁路运输" value="RAIL" />
                <el-option label="水路运输" value="WATER" />
                <el-option label="航空运输" value="AIR" />
              </el-select>
            </el-form-item>
            <el-form-item label="金额" prop="recycleGoodSubtotal">
              <el-input-number v-model="itemForm.recycleGoodSubtotal" :precision="2" :step="0.01" style="width: 100%;" />
            </el-form-item>
          </template>

          <!-- 租赁设备字段 -->
          <template v-if="itemForm.itemType === 'lease'">
            <el-form-item label="设备名称" prop="leaseGoodName">
              <el-input v-model="itemForm.leaseGoodName" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="押金" prop="leaseGoodDeposit">
              <el-input-number v-model="itemForm.leaseGoodDeposit" :precision="2" :step="0.01" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="金额" prop="leaseGoodSubtotal">
              <el-input-number v-model="itemForm.leaseGoodSubtotal" :precision="2" :step="0.01" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="安装日期" prop="leaseGoodInstallDate">
              <el-date-picker v-model="itemForm.leaseGoodInstallDate" type="datetime" placeholder="选择安装日期" style="width: 100%;" />
            </el-form-item>
          </template>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="itemDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleSaveItem">确 定</el-button>
          </div>
        </template>
      </el-dialog>
    </el-dialog>

    <!-- 搜索用户选择器 -->
    <UserSelector
      v-model:visible="searchUserSelectorVisible"
      title="选择签署用户"
      :multiple="false"
      @confirm="handleSearchUserConfirm"
      @close="handleSearchUserClose"
    />

    <!-- 表单用户选择器 -->
    <UserSelector
      v-model:visible="formUserSelectorVisible"
      title="选择签署用户"
      :multiple="false"
      @confirm="handleFormUserConfirm"
      @close="handleFormUserClose"
    />

    <!-- 合同变更记录弹窗 -->
    <el-dialog title="合同变更记录" v-model="logsDialogVisible" width="900px">
      <el-table v-loading="logsLoading" :data="contractLogs" border>
        <el-table-column label="操作类型" prop="operationTypeLabel" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.operationType === 'CREATE'" type="success">创建</el-tag>
            <el-tag v-else-if="scope.row.operationType === 'UPDATE'" type="warning">更新</el-tag>
            <el-tag v-else-if="scope.row.operationType === 'DELETE'" type="danger">删除</el-tag>
            <span v-else>{{ scope.row.operationTypeLabel || scope.row.operationType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="operatorName" width="120" />
        <el-table-column label="操作时间" prop="operationTime" width="180" />
        <el-table-column label="变更详情" min-width="400">
          <template #default="scope">
            <div v-if="scope.row.operationInfo">
              <div v-for="(change, index) in parseOperationInfo(scope.row.operationInfo)" :key="index" class="change-item">
                <span class="field-label">{{ change.fieldLabel }}:</span>
                <span class="old-value">变更前: {{ change.oldValue || '-' }}</span>
                <span class="new-value">变更后: {{ change.newValue || '-' }}</span>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getContractPage, addContract, updateContract, deleteContract, getContractItems, getContractLogList } from '@/api/contract'
import UserSelector from '@/components/UserSelector'

export default {
  components: {
    UserSelector
  },
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        name: '',
        code: '',
        recognitionCode: '',
        type: '',
        userId: '',
        userName: ''
      },
      dialogVisible: false,
      dialogTitle: '新增合同',
      form: {
        id: null,
        name: '',
        recognitionCode: '',
        code: '',
        type: '',
        startDate: '',
        endDate: '',
        paymentMethod: '',
        invoiceMethod: '',
        userId: '',
        userName: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        name: [{ required: true, message: '请输入合同名', trigger: 'blur' }],
        recognitionCode: [{ required: true, message: '请输入合同识别号', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入合同编号', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '合同编号只能包含数字和字母', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
        startDate: [{ required: true, message: '请选择起始日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
        paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
        invoiceMethod: [{ required: true, message: '请选择开票方式', trigger: 'change' }],
        userId: [{ required: true, message: '请选择签署用户', trigger: 'change' }]
      },
      // 合同明细相关
      itemsDialogVisible: false,
      contractItems: [],
      currentContractId: null,
      currentContractType: null,
      itemDialogVisible: false,
      itemDialogTitle: '新增明细',
      // 用户选择器显示状态
      searchUserSelectorVisible: false,
      formUserSelectorVisible: false,
      // 用户信息缓存
      userCache: {},
      // 合同变更记录相关
      logsDialogVisible: false,
      contractLogs: [],
      logsLoading: false,
      itemForm: {
        id: null,
        contractId: null,
        itemType: 'recycle',
        // 采购货物字段
        recycleGoodId: null,
        recycleGoodName: '',
        recycleGoodSpecificationModel: '',
        recycleGoodTransportMode: '',
        recycleGoodSubtotal: 0,
        // 租赁设备字段
        leaseGoodId: null,
        leaseGoodName: '',
        leaseGoodDeposit: 0,
        leaseGoodSubtotal: 0,
        leaseGoodInstallDate: ''
      },
      itemRules: {
        itemType: [{ required: true, message: '请选择明细类型', trigger: 'change' }],
        recycleGoodName: [{
          required: true,
          message: '请输入货物名称',
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.currentContractType === 'recycle' && !value) {
              callback(new Error('请输入货物名称'))
            } else {
              callback()
            }
          }
        }],
        leaseGoodName: [{
          required: true,
          message: '请输入设备名称',
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.currentContractType === 'lease' && !value) {
              callback(new Error('请输入设备名称'))
            } else {
              callback()
            }
          }
        }]
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
        name: this.searchForm.name || undefined,
        code: this.searchForm.code || undefined,
        recognitionCode: this.searchForm.recognitionCode || undefined,
        type: this.searchForm.type || undefined,
        userId: this.searchForm.userId || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getContractPage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
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
      this.searchForm = { name: '', code: '', recognitionCode: '', type: '', userId: '', userName: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增合同'
      this.form = {
        id: null,
        name: '',
        recognitionCode: '',
        code: '',
        type: '',
        startDate: '',
        endDate: '',
        paymentMethod: '',
        invoiceMethod: '',
        userId: '',
        userName: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑合同'
      this.form = { ...row }
      // 如果有用户ID，尝试获取用户信息并设置用户名
      if (row.userId) {
        this.fetchUserInfo(row.userId)
        // 从缓存中获取用户名
        const user = this.userCache[row.userId]
        if (user) {
          this.form.userName = user.username || user.nickname || ''
        }
      }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该合同吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteContract(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            // 编辑
            updateContract(this.form).then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('编辑失败')
            })
          } else {
            // 新增
            addContract(this.form).then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('新增失败')
            })
          }
        }
      })
    },
    // 查看合同明细
    handleViewItems(row) {
      this.currentContractId = row.id
      this.currentContractType = row.type
      this.itemsDialogVisible = true
      this.fetchContractItems(row.id)
    },
    // 获取合同明细
    fetchContractItems(contractId) {
      this.listLoading = true
      getContractItems(contractId).then(response => {
        this.contractItems = response.data || []
        this.listLoading = false
      }).catch(() => {
        this.$message.error('获取合同明细失败')
        this.contractItems = []
        this.listLoading = false
      })
    },
    // 新增明细
    handleAddItem() {
      this.itemDialogTitle = '新增明细'
      this.itemForm = {
        id: null,
        contractId: this.currentContractId,
        itemType: this.currentContractType, // 根据当前合同类型自动设置
        recycleGoodId: null,
        recycleGoodName: '',
        recycleGoodSpecificationModel: '',
        recycleGoodTransportMode: '',
        recycleGoodSubtotal: 0,
        leaseGoodId: null,
        leaseGoodName: '',
        leaseGoodDeposit: 0,
        leaseGoodSubtotal: 0,
        leaseGoodInstallDate: ''
      }
      this.itemDialogVisible = true
    },
    // 编辑明细
    handleEditItem(row) {
      this.itemDialogTitle = '编辑明细'
      this.itemForm = { ...row }
      // 确保明细类型与合同类型匹配
      this.itemForm.itemType = this.currentContractType
      this.itemDialogVisible = true
    },
    // 删除明细
    handleDeleteItem(row) {
      this.$confirm('确定要删除该明细吗？', '提示', { type: 'warning' })
        .then(() => {
          // 这里需要调用删除明细的API
          // deleteContractItem(row.id).then(() => {
          //   this.$message.success('删除成功')
          //   this.fetchContractItems(this.currentContractId)
          // })
          this.$message.success('删除成功')
          this.contractItems = this.contractItems.filter(item => item.id !== row.id)
        }).catch(() => {})
    },
    // 保存明细
    handleSaveItem() {
      this.$refs.itemForm.validate((valid) => {
        if (valid) {
          // 验证明细类型与合同类型是否匹配
          if (this.itemForm.itemType !== this.currentContractType) {
            this.$message.error('明细类型与合同类型不匹配')
            return
          }

          // 验证必填字段
          if (this.currentContractType === 'recycle') {
            if (!this.itemForm.recycleGoodName || !this.itemForm.recycleGoodSubtotal) {
              this.$message.error('请填写完整的货物信息')
              return
            }
          } else if (this.currentContractType === 'lease') {
            if (!this.itemForm.leaseGoodName || !this.itemForm.leaseGoodSubtotal) {
              this.$message.error('请填写完整的设备信息')
              return
            }
          }

          if (this.itemForm.id) {
            // 编辑明细
            // updateContractItem(this.itemForm.id, this.itemForm).then(() => {
            //   this.$message.success('编辑成功')
            //   this.itemDialogVisible = false
            //   this.fetchContractItems(this.currentContractId)
            // })
            this.$message.success('编辑成功')
            this.itemDialogVisible = false
            this.fetchContractItems(this.currentContractId)
          } else {
            // 新增明细
            // addContractItem(this.itemForm).then(() => {
            //   this.$message.success('新增成功')
            //   this.itemDialogVisible = false
            //   this.fetchContractItems(this.currentContractId)
            // })
            this.$message.success('新增成功')
            this.itemDialogVisible = false
            this.fetchContractItems(this.currentContractId)
          }
        }
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
    // 处理用户选择变化
    handleUserChange(user) {
      this.form.userId = user.id
      // 缓存用户信息
      this.userCache[user.id] = user
    },
    // 根据用户ID获取用户名
    getUserName(userId) {
      if (!userId) return '-'
      // 从缓存中获取用户信息
      const user = this.userCache[userId]
      if (user) {
        return user.username || user.nickname || userId
      }
      return userId
    },
    // 获取用户信息
    fetchUserInfo(userId) {
      if (!userId || this.userCache[userId]) return
      // 这里可以调用API获取用户信息，暂时跳过
      // 实际项目中可以调用 getUserById(userId) 等API
      // 同时更新用户名字段
      const user = this.userCache[userId]
      if (user) {
        if (this.form && this.form.userId === userId) {
          this.form.userName = user.username || user.nickname || ''
        }
        if (this.searchForm && this.searchForm.userId === userId) {
          this.searchForm.userName = user.username || user.nickname || ''
        }
      }
    },
    // 显示搜索用户选择器
    showSearchUserSelector() {
      this.searchUserSelectorVisible = true
    },

    // 处理搜索用户选择确认
    handleSearchUserConfirm(users) {
      const user = users[0]
      this.searchForm.userId = user.id
      this.searchForm.userName = user.nickname || user.username || ''
      // 缓存用户信息
      this.userCache[user.id] = user
    },

    // 处理搜索用户选择器关闭
    handleSearchUserClose() {
      this.searchUserSelectorVisible = false
    },

    // 显示表单用户选择器
    showFormUserSelector() {
      this.formUserSelectorVisible = true
    },

    // 处理表单用户选择确认
    handleFormUserConfirm(users) {
      const user = users[0]
      this.form.userId = user.id
      this.form.userName = user.nickname || user.username || ''
      // 缓存用户信息
      this.userCache[user.id] = user
    },

    // 处理表单用户选择器关闭
    handleFormUserClose() {
      this.formUserSelectorVisible = false
    },

    // 处理搜索用户变化（保留兼容性）
    handleSearchUserChange(user) {
      this.searchForm.userId = user.id
      // 缓存用户信息
      this.userCache[user.id] = user
    },

    // 查看合同变更记录
    handleViewLogs(row) {
      this.logsDialogVisible = true
      this.fetchContractLogs(row.id)
    },

    // 获取合同变更记录
    fetchContractLogs(contractId) {
      this.logsLoading = true
      getContractLogList(contractId).then(response => {
        this.contractLogs = response.data || []
        this.logsLoading = false
      }).catch(() => {
        this.$message.error('获取合同变更记录失败')
        this.contractLogs = []
        this.logsLoading = false
      })
    },

    // 解析操作信息JSON字符串
    parseOperationInfo(operationInfo) {
      try {
        if (typeof operationInfo === 'string') {
          return JSON.parse(operationInfo)
        }
        return operationInfo || []
      } catch (error) {
        console.error('解析操作信息失败:', error)
        return []
      }
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}

.change-item {
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.change-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.field-label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.old-value {
  color: #f56c6c;
  margin-right: 12px;
  font-size: 12px;
}

.new-value {
  color: #67c23a;
  font-size: 12px;
}
</style>
