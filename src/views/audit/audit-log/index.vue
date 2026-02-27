<template>
  <div class="audit-audit-log">
    <el-card v-permission="'audit:list'">
      <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
        <el-form-item label="操作者ID">
          <el-input v-model="query.actorUserId" placeholder="可选" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="动作">
          <el-input v-model="query.action" placeholder="可选" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="目标类型">
          <el-input v-model="query.targetType" placeholder="可选" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="目标ID">
          <el-input v-model="query.targetId" placeholder="可选" clearable style="width: 150px" @keyup.enter="handleSearch" />
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
        <el-table-column prop="actorUserId" label="操作者ID" width="120" />
        <el-table-column prop="action" label="动作" width="160" show-overflow-tooltip />
        <el-table-column prop="targetType" label="目标类型" width="160" show-overflow-tooltip />
        <el-table-column prop="targetId" label="目标ID" width="140" show-overflow-tooltip />
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

    <el-dialog title="审计详情" v-model="detailVisible" width="720px">
      <el-descriptions v-if="detail" :column="1" border style="margin-bottom: 10px">
        <el-descriptions-item label="操作者ID">{{ detail.actorUserId }}</el-descriptions-item>
        <el-descriptions-item label="动作">{{ detail.action }}</el-descriptions-item>
        <el-descriptions-item label="目标类型">{{ detail.targetType }}</el-descriptions-item>
        <el-descriptions-item label="目标ID">{{ detail.targetId }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ detail.createTime }}</el-descriptions-item>
      </el-descriptions>
      <el-input
        v-if="detail"
        :model-value="detailJsonText"
        type="textarea"
        :rows="16"
        readonly
      />
      <div v-else style="color: #999">暂无数据</div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getAuditLogPage } from "@/api/admin/auditLog"

export default {
  name: "AuditLogPage",
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      query: {
        current: 1,
        size: 10,
        actorUserId: "",
        action: "",
        targetType: "",
        targetId: "",
        timeRange: []
      },
      detailVisible: false,
      detail: null
    }
  },
  computed: {
    detailJsonText() {
      if (!this.detail) return ""
      const raw =
        this.detail.detail_json ||
        this.detail.detailJson ||
        this.detail.detail ||
        this.detail.requestBody ||
        this.detail.responseBody
      try {
        if (typeof raw === "string") return raw
        return JSON.stringify(raw ?? {}, null, 2)
      } catch (e) {
        return String(raw ?? "")
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
        actorUserId: this.query.actorUserId || undefined,
        action: this.query.action || undefined,
        targetType: this.query.targetType || undefined,
        targetId: this.query.targetId || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getAuditLogPage(this.buildParams())
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
        actorUserId: "",
        action: "",
        targetType: "",
        targetId: "",
        timeRange: []
      }
      this.fetchList()
    },
    openDetail(row) {
      this.detail = row
      this.detailVisible = true
    }
  }
}
</script>

<style scoped>
.audit-audit-log {
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
