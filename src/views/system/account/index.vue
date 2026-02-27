<template>
  <div class="admin-user-list">
    <el-card>
      <el-form :inline="true" :model="search" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="search.username" placeholder="账号" style="width: 180px; margin-right: 10px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
          <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column label="头像" width="80" align="center">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="getAvatarUrl(scope.row.avatar)" :size="50" />
            <el-avatar v-else icon="el-icon-user-solid" :size="50" />
          </template>
        </el-table-column>
        <el-table-column label="业务类型" prop="businessType" width="120" align="center">
          <template #default="scope">
            <span>{{ getBusinessTypeText(scope.row.businessType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="账号" width="200" />
        <el-table-column prop="nickname" label="账号名称" width="200" />
        <el-table-column prop="accountTypeId" label="账号类型" width="200">
          <template #default="scope">
            <span>{{ getAccountType(scope.row.accountTypeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="password" label="密码" width="200" />
        <el-table-column label="身份" prop="useType" width="100" align="center">
          <template #default="scope">
            <span>{{ getUseType(scope.row.useType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评级" prop="score" width="60" align="center" />
        <el-table-column label="评级系数" prop="scoreFactor" width="90" align="center" />
        <el-table-column label="积分" prop="point" width="80" align="center" />
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              :type="scope.row.status === 'use' ? 'danger' : 'success'"
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 'use' ? '停用' : '启用' }}
            </el-button>
            <el-button
              v-if="scope.row.businessType !== 'service_provider'"
              size="mini"
              type="warning"
              @click="handleChangeBusinessType(scope.row)"
            >
              转为服务商
            </el-button>
            <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
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
    <el-dialog :title="dialogTitle" width="500px" v-model="dialogVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="头像" prop="avatar">
          <image-uploader
            v-model="form.avatar"
            :multiple="false"
            :limit="1"
            :emit-raw="true"
            tips="建议上传尺寸为200x200的图片"
          />
        </el-form-item>
        <el-form-item label="账号类型" prop="accountTypeId">
          <el-select
            v-model="form.accountTypeId"
            placeholder="请选择账号类型"
            @change="handleAccountTypeChange"
          >
            <el-option
              v-for="accountType in accountTypes"
              :key="accountType.id"
              :label="accountType.typeName"
              :value="accountType.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="公司账号则为公司名，自然人账号则为该人的名字" />
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="taxNumber">
          <el-input v-model="form.taxNumber" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="身份" prop="useType">
          <el-select v-model="form.useType" placeholder="请选择身份">
            <el-option v-for="item in useTypeList" :key="item.key" :label="item.value" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="评级" prop="score">
          <el-input v-model="form.score" />
        </el-form-item>
        <el-form-item label="评级系数" prop="scoreFactor">
          <el-input-number
            v-model="form.scoreFactor"
            :min="0"
            :max="1"
            :step="0.01"
            :precision="2"
            :controls="false"
            placeholder="0-1，最多2位小数"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="积分" prop="point">
          <el-input v-model="form.point" disabled placeholder="积分初始值为0" />
        </el-form-item>
        <el-form-item label="编号(账号)" prop="username">
          <el-input v-model="form.username" disabled placeholder="专责用户类型后，自动按序生成账号编号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSave">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 这里的接口方法请后续补充联动
import {
  getUserPage, createWxUser, updateWxUser, changeWxUserStatus,
  deleteWxUser, changeWxUserType, generateAccountUsername, getUseTypeList,
  changeWxUserBusinessType
} from '@/api/user'
import { getAccountTypeList } from '@/api/accountType'
import ImageUploader from '@/components/ImageUploader/index.vue'

const ASSET_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_API || '').replace(/\/+$/, '')

export default {
  name: 'AdminUserList',
  components: {
    ImageUploader
  },
  data() {
    const validateScoreFactor = (rule, value, callback) => {
      if (value === '' || value === null || value === undefined) {
        callback()
        return
      }
      const num = Number(value)
      if (Number.isNaN(num)) {
        callback(new Error('评级系数只能输入0-1的小数'))
        return
      }
      if (num < 0 || num > 1) {
        callback(new Error('评级系数必须在0到1之间'))
        return
      }
      const scaled = Math.round(num * 100)
      if (Math.abs(num * 100 - scaled) > 1e-8) {
        callback(new Error('评级系数最多保留2位小数'))
        return
      }
      callback()
    }

    return {
      useTypeList: [],
      accountTypes: [],
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        username: '',
        type: '',
        phone: '',
        businessType: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: undefined,
        type: '',
        businessType: 'supplier',
        username: '',
        password: '',
        avatar: '',
        // phone: '',
        // idCard: '',
        score: '',
        scoreFactor: null,
        taxNumber: '',
        bankName: '',
        bankAccount: '',
        credit_code: '',
        address: '',
        contact_phone: '',
        nickname: '',
        point: 0,
        status: 1
      },
      rules: {
        // type: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
        accountTypeId: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        scoreFactor: [{ validator: validateScoreFactor, trigger: 'blur' }]
      },
      updateRules: {
        ...this.rules
      }
    }
  },
  created() {
    this.getAccountTypes()
    this.getUseTypeList()
    this.fetchList()
  },
  methods: {
    getUseTypeList() {
      getUseTypeList().then(res => {
        this.useTypeList = res.data
      })
    },
    getAccountTypes() {
      getAccountTypeList().then(res => {
        this.accountTypes = res.data
      })
    },
    fetchList() {
      getUserPage({
        pageNum: this.page,
        pageSize: this.pageSize,
        isFilterPass: false,
        ...this.search
      }).then(res => {
        this.list = res.data.records
        this.total = res.data.total
      })
    },
    handleAdd() {
      this.dialogTitle = '新增用户'
      this.form = {
        id: null,
        type: '',
        businessType: 'supplier',
        username: '',
        password: '',
        avatar: '',
        phone: '',
        idCard: '',
        score: '',
        scoreFactor: null,
        taxNumber: '',
        bankName: '',
        bankAccount: '',
        credit_code: '',
        address: '',
        contact_phone: '',
        payAccount1: '',
        payAccount2: '',
        payAccount3: '',
        nickname: '',
        point: 0,
        status: 1
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = {
        ...row,
        scoreFactor: this.normalizeScoreFactor(row.scoreFactor)
      }
      this.dialogVisible = true
    },
    handleEditPassword(row) {
      this.dialogTitle = '修改密码'
      this.form = { ...row }
      this.dialogVisible = true
    },
    // 设置用户使用类型方法
    handleChangeUseType(id, useType) {
      changeWxUserType(id, useType).then(res => {
        this.$message.success('设置成功')
        this.fetchList()
      })
    },
    handleDelete(row) {
      deleteWxUser(row.id).then(res => {
        this.$message.success('删除成功')
        this.fetchList()
      })
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          updateWxUser(this.form).then(res => {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.fetchList()
          })
        } else {
          createWxUser(this.form).then(res => {
            this.$message.success('新增成功')
            this.dialogVisible = false
            this.fetchList()
          })
        }
      })
    },
    handleStatusChange(row) {
      changeWxUserStatus(row.id).then(res => {
        this.$message.success('用户状态变更成功')
        this.fetchList()
      })
    },
    handleTypeChange() {
      // 切换类型时清空企业专属字段
      if (this.form.type === 'person') {
        this.form.score = ''
        this.form.taxNumber = ''
        this.form.bankName = ''
        this.form.bankAccount = ''
        this.form.credit_code = ''
        this.form.address = ''
        this.form.contact_phone = ''
        this.form.payAccount1 = ''
        this.form.payAccount2 = ''
        this.form.payAccount3 = ''
      }
    },
    // 切换用户类型时
    handleAccountTypeChange() {
      generateAccountUsername(this.form.id, this.form.accountTypeId).then(res => {
        this.form.username = res.data
      })
    },
    // 列表用户类型
    getType(type) {
      if (type === 'company') {
        return '企业'
      } else if (type === 'person') {
        return '个人'
      } else {
        return '未设置'
      }
    },
    getAccountType(id) {
      return this.accountTypes.find(item => item.id === id)?.typeName
    },
    getUseType(id) {
      return this.useTypeList.find(item => item.key === id)?.value
    },
    // 用户业务类型文案
    getBusinessTypeText(businessType) {
      if (businessType === 'supplier') {
        return '供应商'
      }
      if (businessType === 'service_provider') {
        return '服务商'
      }
      return '未设置'
    },
    // 转为服务商
    handleChangeBusinessType(row) {
      this.$confirm('确认将该账号从供应商转为服务商吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return changeWxUserBusinessType(row.id, 'service_provider')
      }).then(() => {
        this.$message.success('已成功转为服务商')
        this.fetchList()
      }).catch(() => {})
    },
    // 获取完整的头像URL
    getAvatarUrl(avatar) {
      if (!avatar) return ''
      // 如果已经是完整的URL（http/https开头），直接返回
      if (/^(?:[a-z]+:)?\/\//i.test(avatar) || /^data:/i.test(avatar)) {
        return avatar
      }
      // 否则拼接baseUrl
      const path = avatar.startsWith('/') ? avatar : `/${avatar}`
      return `${ASSET_BASE_URL}${path}`
    },
    normalizeScoreFactor(value) {
      if (value === '' || value === null || value === undefined) return null
      const num = Number(value)
      return Number.isNaN(num) ? null : num
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>
