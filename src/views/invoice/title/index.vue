<template>
  <div class="invoice-title-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.title" placeholder="发票抬头名称" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.taxNumber" placeholder="纳税人识别号" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增抬头</el-button>
      </div>
      <el-table v-loading="loading" :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="accountName" label="账户" width="180" />
        <el-table-column prop="isDefault" label="是否默认" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isDefault === '1' ? 'success' : 'info'">
              {{ scope.row.isDefault === '1' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="发票抬头名称" width="180" />
        <el-table-column prop="taxNumber" label="纳税人识别号" width="180" />
        <el-table-column prop="registeredAddress" label="注册地址" width="200" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="bankName" label="开户行" width="180" />
        <el-table-column prop="bankCode" label="联行号" width="150" />

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          v-model:page-size="pageSize"
          v-model:current-page="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="账户名称" prop="accountName">
              <el-input v-model="form.accountName" placeholder="请选择用户" readonly @focus="openUserSelector">
                <template #append>
                  <el-button icon="el-icon-search" @click="openUserSelector">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票抬头名称" prop="title">
              <el-input v-model="form.title" placeholder="请输入发票抬头名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纳税人识别号" prop="taxNumber">
              <el-input v-model="form.taxNumber" placeholder="请输入纳税人识别号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册地址" prop="registeredAddress">
              <el-input v-model="form.registeredAddress" placeholder="请输入注册地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户行名称" prop="bankName">
              <el-input v-model="form.bankName" placeholder="请输入开户行名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联行号" prop="bankCode">
              <el-input v-model="form.bankCode" placeholder="请输入联行号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号" prop="bankAccount">
              <el-input v-model="form.bankAccount" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否设置为默认开票信息" prop="isDefault">
              <el-select v-model="form.isDefault" placeholder="请选择" style="width: 100%;">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户选择器 -->
    <UserSelector
      v-model:visible="userSelectorVisible"
      title="选择用户"
      :multiple="false"
      @confirm="handleUserConfirm"
      @close="handleUserClose"
    />

  </div>
</template>

<script>
import { getInvoiceTitlePage, createInvoiceTitle, updateInvoiceTitle, deleteInvoiceTitle } from '@/api/invoice'
import UserSelector from '@/components/UserSelector'

export default {
  name: 'InvoiceTitleList',
  components: { UserSelector },
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        title: '',
        taxNumber: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        accountId: '',
        accountName: '',
        type: '',
        title: '',
        taxNumber: '',
        registeredAddress: '',
        phone: '',
        bankName: '',
        bankCode: '',
        bankAccount: '',
        isDefault: '0'
      },
      rules: {
        accountName: [{ required: true, message: '请选择账户名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择发票抬头类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入发票抬头名称', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        bankName: [{ required: true, message: '请输入开户行名称', trigger: 'blur' }],
        bankCode: [{ required: true, message: '请输入联行号', trigger: 'blur' }],
        bankAccount: [{ required: true, message: '请输入银行账号', trigger: 'blur' }],
        isDefault: [{ required: true, message: '请选择是否设置为默认开票信息', trigger: 'change' }]
      },
      userSelectorVisible: false
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      const params = {
        page: this.page,
        size: this.pageSize,
        ...this.search
      }

      try {
        const res = await getInvoiceTitlePage(params)
        this.list = res.data.records || res.data || []
        this.total = res.data.total || 0
      } catch (error) {
        console.error('获取发票抬头列表失败:', error)
        this.$message.error('获取发票抬头列表失败')
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.dialogTitle = '新增抬头'
      this.form = {
        id: null,
        accountId: '',
        accountName: '',
        type: '',
        title: '',
        taxNumber: '',
        registeredAddress: '',
        phone: '',
        bankName: '',
        bankCode: '',
        bankAccount: '',
        isDefault: '0'
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑抬头'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该抬头吗？', '提示', { type: 'warning' }).then(async() => {
        try {
          await deleteInvoiceTitle(row.id)
          this.$message.success('删除成功')
          this.fetchList()
        } catch (error) {
          console.error('删除发票抬头失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    async handleSave() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        try {
          const action = this.form.id ? updateInvoiceTitle : createInvoiceTitle
          await action(this.form)
          this.$message.success(this.form.id ? '更新成功' : '新增成功')
          this.dialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('保存发票抬头失败:', error)
          this.$message.error('保存失败')
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.page = 1
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.fetchList()
    },
    openUserSelector() {
      this.userSelectorVisible = true
    },
    handleUserConfirm(selected) {
      const user = Array.isArray(selected) ? selected[0] : selected
      if (!user) return
      this.form.accountId = user.id
      this.form.accountName = user.nickname
      this.userSelectorVisible = false
    },
    handleUserClose() {
      this.userSelectorVisible = false
    }
  }
}
</script>

<style scoped>
.invoice-title-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style>
