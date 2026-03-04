<template>
  <div class="app-container dashboard">
    <el-row :gutter="16" style="row-gap: 16px">
      <el-col :xs="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>欢迎</span>
              <span class="muted">{{ envText }}</span>
            </div>
          </template>
          <div class="welcome">
            <div class="welcome__title">欢迎回来，{{ name || "用户" }}</div>
            <div class="welcome__sub">{{ todayText }} · {{ nowText }}</div>
            <el-alert
              class="welcome__tip"
              type="info"
              :closable="false"
              show-icon
              title="提示：如需更丰富的首页内容，可接入待办/预警/统计等接口进行展示。"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="row-gap: 16px; margin-top: 16px;">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
            </div>
          </template>
          <el-skeleton v-if="noticeLoading" :rows="4" animated />
          <div v-else-if="notices.length" class="notice-list">
            <div
              v-for="item in notices"
              :key="item.id"
              class="notice-item"
              @click="openNotice(item)"
            >
              <div class="notice-item__title">{{ item.title }}</div>
              <div class="notice-item__meta">{{ formatNoticeTime(item.createTime) }}</div>
              <div class="notice-item__summary">{{ summary(item.content) }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无公告" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>代办</span>
            </div>
          </template>
          <el-empty description="代办功能开发中" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="noticeDialogVisible" title="公告详情" width="680px">
      <template v-if="activeNotice">
        <h3 class="notice-detail-title">{{ activeNotice.title }}</h3>
        <p class="notice-detail-time">{{ formatNoticeTime(activeNotice.createTime) }}</p>
        <pre class="notice-detail-content">{{ activeNotice.content || "--" }}</pre>
      </template>
      <template #footer>
        <el-button @click="noticeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { parseTime } from "@/utils"
import { useUserStore } from "@/stores/user"
import { getHomeAnnouncements } from "@/api/admin/announcement"

const userStore = useUserStore()
const name = computed(() => userStore.name)

const now = ref(new Date())
const nowText = computed(() => parseTime(now.value, "{y}-{m}-{d} {h}:{i}") || "")
const todayText = computed(() => parseTime(now.value, "{y}-{m}-{d} 星期{a}") || "")
const envText = computed(() => (import.meta.env.MODE || "").toUpperCase() || "UNKNOWN")
const noticeLoading = ref(false)
const notices = ref([])
const noticeDialogVisible = ref(false)
const activeNotice = ref(null)

let timer = null

function formatNoticeTime(time) {
  return parseTime(time, "{y}-{m}-{d} {h}:{i}") || "--"
}

function summary(content) {
  if (!content) return "--"
  const text = String(content).replace(/\s+/g, " ").trim()
  return text.length > 70 ? `${text.slice(0, 70)}...` : text
}

function openNotice(item) {
  activeNotice.value = item
  noticeDialogVisible.value = true
}

async function fetchNotices() {
  noticeLoading.value = true
  try {
    const res = await getHomeAnnouncements({ limit: 5 })
    notices.value = res?.data || []
  } catch (e) {
    notices.value = []
  } finally {
    noticeLoading.value = false
  }
}

onMounted(() => {
  fetchNotices()
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 30_000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.dashboard {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .muted {
    color: #94a3b8;
    font-size: 12px;
  }

  .welcome {
    &__title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      line-height: 26px;
    }

    &__sub {
      margin-top: 6px;
      color: #64748b;
      font-size: 13px;
      line-height: 20px;
    }

    &__tip {
      margin-top: 12px;
    }
  }

  .notice-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notice-item {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    &__title {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      line-height: 20px;
    }

    &__meta {
      margin-top: 4px;
      font-size: 12px;
      color: #64748b;
    }

    &__summary {
      margin-top: 6px;
      font-size: 13px;
      color: #334155;
      line-height: 20px;
    }
  }

  .notice-detail-title {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
  }

  .notice-detail-time {
    margin: 8px 0 12px;
    font-size: 12px;
    color: #64748b;
  }

  .notice-detail-content {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2937;
    font-family: inherit;
  }
}
</style>
