<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="clearfix">
          <span>客户管理 - {{ userName }}</span>
          <div style="float: right;">
            <el-button type="primary" size="small" @click="showUserSelector">添加客户</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="客户账号ID" prop="customerAccountId" width="150" />
        <el-table-column label="客户名称" prop="customerAccountName" width="200">
          <template #default="scope">
            <span>{{ scope.row.customerAccountName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户选择器 -->
    <UserSelector
      v-model:visible="userSelectorVisible"
      title="选择客户（供应商）"
      :multiple="false"
      :business-type="'supplier'"
      @confirm="handleUserSelected"
      @close="handleUserSelectorClose"
    />
  </div>
</template>

<script>
import { getCustomerList, addCustomer, deleteCustomer } from '@/api/customer'
import UserSelector from '@/components/UserSelector'

export default {
  name: 'CustomerManagement',
  components: {
    UserSelector
  },
  data() {
    return {
      userId: this.$route.params.userId,
      userName: this.$route.query.nickname || '',
      loading: false,
      userSelectorVisible: false,
      tableData: [] // 客户列表数据
    }
  },
  created() {
    if (!this.userId) {
      this.$message.error('缺少服务商ID')
      this.$router.back()
      return
    }
    this.fetchData()
  },
  methods: {
    // 查询当前服务商的客户列表
    fetchData() {
      this.loading = true
      getCustomerList(this.userId).then(res => {
        // 接口返回的数据结构：id, accountId, customerAccountId, accountName, customerAccountName
        this.tableData = res.data || []
      }).catch(err => {
        console.error('获取客户列表失败:', err)
        this.$message.error('获取客户列表失败')
        this.tableData = []
      }).finally(() => {
        this.loading = false
      })
    },
    // 显示用户选择器
    showUserSelector() {
      this.userSelectorVisible = true
    },
    // 用户选择回调（单选模式）
    handleUserSelected(users) {
      if (!users || users.length === 0) {
        return
      }

      // 单选模式下，users 数组只有一个元素
      const user = users[0]

      // 检查是否已存在
      const existingIds = this.tableData.map(item => item.customerAccountId)
      if (existingIds.includes(user.id)) {
        this.$message.warning('该用户已在客户列表中')
        return
      }

      // 调用接口添加客户
      addCustomer({
        accountId: this.userId,
        customerAccountId: user.id
      }).then(() => {
        this.$message.success('添加客户成功')
        // 重新获取列表
        this.fetchData()
      }).catch(err => {
        console.error('添加客户失败:', err)
        this.$message.error('添加客户失败')
      })
    },
    // 用户选择器关闭
    handleUserSelectorClose() {
      this.userSelectorVisible = false
    },
    // 删除客户
    handleDelete(row) {
      if (!row.id) {
        this.$message.error('缺少客户ID，无法删除')
        return
      }

      this.$confirm('确认删除该客户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteCustomer(row.id)
      }).then(() => {
        this.$message.success('删除成功')
        // 重新获取列表
        this.fetchData()
      }).catch(err => {
        console.error('删除客户失败:', err)
        this.$message.error('删除客户失败')
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
