<template>
  <div class="bank-info-list">

    <el-form :inline="true" :model="search" label-width="80px">
      <el-form-item label="账户名称">
        <el-input v-model="search.accountName" placeholder="请输入账户名称" @focus="showSearchUserSelector" />
      </el-form-item>
      <el-form-item label="开户行">
        <el-input v-model="search.bankName" placeholder="开户行" style="width: 180px; margin-right: 10px;" />
      </el-form-item>
      <el-form-item label="银行卡号">
        <el-input v-model="search.cardNumber" placeholder="银行卡号" style="width: 180px; margin-right: 10px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增银行信息</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="accountName" label="账户名称" width="120" />
      <el-table-column prop="bankName" label="开户行" width="150" />
      <el-table-column prop="cardNumber" label="银行卡号" width="180" />
      <el-table-column prop="bankCode" label="联行号" width="120" />
      <el-table-column label="是否默认" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.isDefault === '1'" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
      <el-table-column label="操作" fixed="right">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.isDefault === YES_OR_NO.NO" size="mini" type="warning" @click="handleSetDefault(scope.row)">设为默认</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" width="500px" v-model="dialogVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="账户" prop="accountId">
          <el-input v-model="form.accountName" placeholder="请输入账户名称" readonly>
            <template #append>
              <el-button icon="el-icon-search" @click="showUserSelector" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="开户行" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入开户行名称" />
        </el-form-item>
        <el-form-item label="银行卡号" prop="cardNumber">
          <el-input v-model="form.cardNumber" placeholder="请输入银行卡号" />
        </el-form-item>
        <el-form-item label="联行号" prop="bankCode">
          <el-input v-model="form.bankCode" placeholder="请输入联行号" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="form.isDefault" placeholder="请选择是否默认">
            <el-option label="是" :value="YES_OR_NO.YES" />
            <el-option label="否" :value="YES_OR_NO.NO" />
          </el-select>
        </el-form-item>
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
      @close="userSelectorVisible = false"
    />
    <UserSelector
      v-model:visible="searchUserSelectorVisible"
      title="选择用户"
      :multiple="false"
      @confirm="handleSearchUserConfirm"
      @close="searchUserSelectorVisible = false"
    />
  </div>
</template>

<script>
import {
  getBankInfoList,
  createBankInfo,
  updateBankInfo,
  deleteBankInfo,
  setDefaultBankInfo
} from '@/api/bankInfo'
import UserSelector from '@/components/UserSelector'
import { YES_OR_NO } from '@/constants/common'
export default {
  name: 'BankInfoList',
  components: {
    UserSelector
  },
  data() {
    return {
      YES_OR_NO,
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        accountId: '',
        bankName: '',
        cardNumber: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      userSelectorVisible: false,
      searchUserSelectorVisible: false,
      form: {
        id: undefined,
        accountId: '',
        bankName: '',
        cardNumber: '',
        bankCode: '',
        isDefault: YES_OR_NO.NO
      },
      rules: {
        accountId: [{ required: true, message: '请输入账户ID', trigger: 'blur' }],
        bankName: [{ required: true, message: '请输入开户行名称', trigger: 'blur' }],
        cardNumber: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      this.loading = true
      getBankInfoList({
        pageNum: this.page,
        pageSize: this.pageSize,
        ...this.search
      }).then(res => {
        this.list = res.data.records
        this.total = res.data.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleAdd() {
      this.dialogTitle = '新增银行信息'
      this.form = {
        id: undefined,
        accountId: '',
        bankName: '',
        cardNumber: '',
        bankCode: '',
        isDefault: YES_OR_NO.NO
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑银行信息'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleSetDefault(row) {
      this.$confirm('确定要设为默认银行信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setDefaultBankInfo(row.id).then(res => {
          this.$message.success('设置默认成功')
          this.fetchList()
        })
      })
    },
    // 重置搜索
    resetSearch() {
      this.search = {
        accountId: '',
        accountName: '',
        bankName: '',
        cardNumber: ''
      }
      this.fetchList()
    },
    handleSearchUserConfirm(users) {
      if (users && users.length > 0) {
        const selectedUser = users[0]
        this.search.accountId = selectedUser.id
        this.search.accountName = selectedUser.nickname
      }
      this.searchUserSelectorVisible = false
    },
    handleDelete(row) {
      this.$confirm('确定要删除该银行信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBankInfo(row.id).then(res => {
          this.$message.success('删除成功')
          this.fetchList()
        })
      })
    },
    // 显示用户选择器（用于选择账户ID）
    showUserSelector() {
      this.userSelectorVisible = true
    },
    showSearchUserSelector() {
      this.searchUserSelectorVisible = true
    },
    // 处理用户选择确认
    handleUserConfirm(users) {
      if (users && users.length > 0) {
        const selectedUser = users[0]
        this.form.accountId = selectedUser.id
        this.form.accountName = selectedUser.nickname
      }
      this.userSelectorVisible = false
    },

    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          updateBankInfo(this.form).then(res => {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.fetchList()
          })
        } else {
          createBankInfo(this.form).then(res => {
            this.$message.success('新增成功')
            this.dialogVisible = false
            this.fetchList()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.bank-info-list {
  padding: 20px;
}
</style>
