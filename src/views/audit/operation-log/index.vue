<template>
  <div class="audit-operation-log">
    <el-card v-permission="'audit:list'">
      <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
        <el-form-item label="用户ID">
          <el-input v-model="query.userId" placeholder="可选" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="query.operationType" placeholder="可选" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="可选" clearable style="width: 180px" @keyup.enter="handleSearch" />
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
          <el-button style="margin-left: 10px" :loading="statsLoading" @click="openStatistics">统计</el-button>
          <el-button type="danger" style="margin-left: 10px" :loading="cleanLoading" @click="openClean">清理</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" border style="width: 100%; margin-top: 10px">
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="operationType" label="类型" width="160" show-overflow-tooltip />
        <el-table-column prop="keyword" label="关键字" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
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

    <el-dialog title="操作日志详情" v-model="detailVisible" width="760px">
      <el-input :model-value="detailText" type="textarea" :rows="18" readonly />
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="操作日志统计" v-model="statsVisible" width="680px">
      <el-input :model-value="statsText" type="textarea" :rows="16" readonly />
      <template #footer>
        <el-button @click="statsVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  cleanOperationLog,
  getOperationLogInfo,
  getOperationLogPage,
  getOperationLogStatistics
} from "@/api/admin/operationLog"

export default {
  name: "OperationLogPage",
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      query: {
        current: 1,
        size: 10,
        userId: "",
        operationType: "",
        keyword: "",
        timeRange: []
      },
      detailVisible: false,
      detail: null,
      statsVisible: false,
      stats: null,
      statsLoading: false,
      cleanLoading: false
    }
  },
  computed: {
    detailText() {
      try {
        return JSON.stringify(this.detail ?? {}, null, 2)
      } catch (e) {
        return String(this.detail ?? "")
      }
    },
    statsText() {
      try {
        return JSON.stringify(this.stats ?? {}, null, 2)
      } catch (e) {
        return String(this.stats ?? "")
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
        userId: this.query.userId || undefined,
        operationType: this.query.operationType || undefined,
        keyword: this.query.keyword || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getOperationLogPage(this.buildParams())
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
        userId: "",
        operationType: "",
        keyword: "",
        timeRange: []
      }
      this.fetchList()
    },
    async openDetail(row) {
      this.detailVisible = true
      this.detail = row
      try {
        const res = await getOperationLogInfo(row.id)
        this.detail = res?.data || row
      } catch (e) {
        // keep row
      }
    },
    async openStatistics() {
      this.statsLoading = true
      try {
        const res = await getOperationLogStatistics()
        this.stats = res?.data ?? res
        this.statsVisible = true
      } finally {
        this.statsLoading = false
      }
    },
    openClean() {
      this.$confirm("确认清理最近 N 天之前的操作日志？", "提示", {
        type: "warning",
        confirmButtonText: "继续",
        cancelButtonText: "取消"
      })
        .then(() => {
          return this.$prompt("请输入保留天数（默认 30）", "清理操作日志", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputValue: "30"
          })
        })
        .then(async ({ value }) => {
          const days = Number(value) || 30
          this.cleanLoading = true
          try {
            await cleanOperationLog(days)
            this.$message.success("清理成功")
            this.fetchList()
          } finally {
            this.cleanLoading = false
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.audit-operation-log {
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
