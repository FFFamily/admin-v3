<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.prevent>
      <el-form-item label="账号名称">
        <el-input v-model="searchForm.accountName" placeholder="请输入账号名称" />
      </el-form-item>
      <el-form-item label="编号">
        <el-input v-model="searchForm.no" placeholder="请输入编号" />
      </el-form-item>
      <el-form-item label="经办人姓名">
        <el-input v-model="searchForm.name" placeholder="请输入经办人姓名" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="searchForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增经办人</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="margin-top: 20px;">
      <el-table-column label="编号" prop="no" width="120" />
      <el-table-column label="账号名称" prop="accountName" width="150" />
      <el-table-column label="经办人姓名" prop="name" width="120" />
      <el-table-column label="手机号" prop="phone" width="150" />
      <el-table-column label="身份证号" prop="idCard" width="200" />
      <el-table-column label="住址" prop="address" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="账号名称" prop="accountName">
          <div style="display: flex; align-items: center;">
            <el-input v-model="form.accountName" placeholder="请选择用户账号" readonly style="flex: 1; margin-right: 10px;">
              <template #append>
                <el-button type="primary" @click="showUserSelector">选择用户</el-button>
              </template>
            </el-input>
          </div>
          <div v-if="selectedUser" style="margin-top: 8px; color: #666; font-size: 12px;">
            已选择：{{ selectedUser.nickname }} ({{ selectedUser.username }})
          </div>
        </el-form-item>
        <el-form-item label="编号" prop="no">
          <el-input v-model="form.no" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="经办人姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入经办人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="住址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="3" placeholder="请输入详细住址" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <UserSelector
      v-model:visible="userSelectorVisible"
      title="选择用户账号"
      :multiple="false"
      @confirm="handleUserConfirm"
      @close="handleUserSelectorClose"
    />
  </div>
</template>

<script>
import { getAgentPage, addAgent, updateAgent, deleteAgent } from '@/api/agent'
import UserSelector from '@/components/UserSelector/index.vue'

export default {
  name: 'AgentManagement',
  components: { UserSelector },
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        accountName: '',
        no: '',
        name: '',
        phone: ''
      },
      dialogVisible: false,
      dialogTitle: '新增经办人',
      form: {
        id: null,
        accountId: '',
        accountName: '',
        no: '',
        name: '',
        phone: '',
        idCard: '',
        address: ''
      },
      userSelectorVisible: false,
      selectedUser: null,
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        accountId: [
          { required: true, message: '请选择账号', trigger: 'change' }
        ],
        no: [
          { required: true, message: '请输入编号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入经办人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { pattern: /(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入住址', trigger: 'blur' },
          { max: 200, message: '住址长度不能超过 200 个字符', trigger: 'blur' }
        ]
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
        accountName: this.searchForm.accountName || undefined,
        no: this.searchForm.no || undefined,
        name: this.searchForm.name || undefined,
        phone: this.searchForm.phone || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getAgentPage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { accountName: '', no: '', name: '', phone: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增经办人'
      this.form = {
        id: null,
        accountId: '',
        accountName: '',
        no: '',
        name: '',
        phone: '',
        idCard: '',
        address: ''
      }
      this.selectedUser = null
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑经办人'
      this.form = { ...row }
      this.selectedUser = null
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该经办人吗？', '提示', { type: 'warning' })
        .then(() => deleteAgent(row.id))
        .then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        })
        .catch(() => {})
    },
    handleSave() {
      const formRef = this.$refs.formRef
      if (!formRef) return
      formRef.validate(valid => {
        if (!valid) return
        const req = this.form.id ? updateAgent(this.form.id, this.form) : addAgent(this.form)
        req.then(() => {
          this.$message.success(this.form.id ? '编辑成功' : '新增成功')
          this.dialogVisible = false
          this.fetchData()
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
    showUserSelector() {
      this.userSelectorVisible = true
    },
    handleUserConfirm(users) {
      const user = Array.isArray(users) ? users[0] : users
      if (!user) return
      this.selectedUser = user
      this.form.accountId = user.id
      this.form.accountName = user.nickname || user.username || ''
      this.userSelectorVisible = false
    },
    handleUserSelectorClose() {
      this.userSelectorVisible = false
    }
  }
}
</script>
