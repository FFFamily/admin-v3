<template>
  <div class="admin-user-list">
    <el-card>
      <el-form :inline="true" :model="search" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="search.username" placeholder="账号" style="width: 180px; margin-right: 10px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column label="头像" width="80" align="center">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="getAvatarUrl(scope.row.avatar)" :size="50" />
            <el-avatar v-else icon="el-icon-user-solid" :size="50" />
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
        <el-table-column label="业务类型" prop="businessType" width="120" align="center">
          <template #default="scope">
            <span>{{ getBusinessTypeText(scope.row.businessType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评级" prop="score" width="60" align="center" />
        <el-table-column label="评级系数" prop="scoreFactor" width="90" align="center" />
        <el-table-column label="积分" prop="point" width="80" align="center" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="goServiceScope(scope.row)">服务范围管理</el-button>
            <el-button size="mini" type="success" style="margin-left: 5px;" @click="goCustomerManagement(scope.row)">客户管理</el-button>
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
  </div>
</template>

<script>
import {
  getUserPage,
  getUseTypeList
} from '@/api/user'
import { getAccountTypeList } from '@/api/accountType'

const ASSET_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_API || '').replace(/\/+$/, '')

export default {
  name: 'ServiceProviderUserList',
  components: {},
  data() {
    return {
      useTypeList: [],
      accountTypes: [],
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      // 只能查询业务类型为服务商的用户
      search: {
        username: '',
        type: '',
        phone: '',
        businessType: 'service_provider'
      },
      loading: false
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
    getAccountType(id) {
      return this.accountTypes.find(item => item.id === id)?.typeName
    },
    getUseType(id) {
      return this.useTypeList.find(item => item.key === id)?.value
    },
    getBusinessTypeText(businessType) {
      if (businessType === 'supplier') {
        return '供应商'
      }
      if (businessType === 'service_provider') {
        return '服务商'
      }
      return '未设置'
    },
    // 跳转到服务范围管理
    goServiceScope(row) {
      this.$router.push({
        name: 'ServiceProviderUserScope',
        params: {
          userId: row.id
        },
        query: {
          nickname: row.nickname || row.username
        }
      })
    },
    // 跳转到客户管理
    goCustomerManagement(row) {
      this.$router.push({
        name: 'ServiceProviderCustomer',
        params: {
          userId: row.id
        },
        query: {
          nickname: row.nickname || row.username
        }
      })
    },
    // 获取完整的头像URL
    getAvatarUrl(avatar) {
      if (!avatar) return ''
      // 如果已经是完整的URL（http/https开头），直接返回
      if (/^(?:[a-z]+:)?\/\//i.test(avatar) || /^data:/i.test(avatar)) {
        return avatar
      }
      const path = avatar.startsWith('/') ? avatar : `/${avatar}`
      return `${ASSET_BASE_URL}${path}`
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>
