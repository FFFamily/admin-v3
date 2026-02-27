<template>
  <div class="audit-login-log">
    <el-card v-permission="'audit:list'">
      <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="可选" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="query.success" placeholder="全部" clearable style="width: 140px">
            <el-option label="成功" value="true" />
            <el-option label="失败" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="query.ip" placeholder="可选" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="query.loginType" placeholder="可选" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="query.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" border style="width: 100%; margin-top: 10px">
        <el-table-column prop="username" label="用户名" width="160" />
        <el-table-column prop="success" label="结果" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.success === true" type="success">成功</el-tag>
            <el-tag v-else-if="row.success === false" type="danger">失败</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="loginType" label="类型" width="120" />
        <el-table-column prop="msg" label="信息" min-width="220" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="180" />
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getLoginLogPage } from "@/api/admin/loginLog"

export default {
  name: "LoginLogPage",
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      query: {
        current: 1,
        size: 10,
        username: "",
        success: "",
        ip: "",
        loginType: "",
        timeRange: []
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    buildParams() {
      const [startTime, endTime] = this.query.timeRange || []
      return {
        current: this.query.current,
        size: this.query.size,
        username: this.query.username || undefined,
        success:
          this.query.success === "" || this.query.success == null
            ? undefined
            : this.query.success === "true",
        ip: this.query.ip || undefined,
        loginType: this.query.loginType || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getLoginLogPage(this.buildParams())
        const page = res?.data || {}
        this.list = page.records || []
        this.total = page.total || 0
      } catch (e) {
        this.list = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.query.current = 1
      this.fetchList()
    },
    handleReset() {
      this.query = {
        current: 1,
        size: 10,
        username: "",
        success: "",
        ip: "",
        loginType: "",
        timeRange: []
      }
      this.fetchList()
    }
  }
}
</script>

<style scoped>
.audit-login-log {
  padding: 20px;
}
.query-form {
  margin-bottom: 6px;
}
.pager {
  margin-top: 16px;
  text-align: right;
}
</style>
