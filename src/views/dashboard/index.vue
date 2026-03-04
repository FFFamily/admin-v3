<template>
  <div class="app-container dashboard">
    <el-row :gutter="16" style="row-gap: 16px">
      <el-col :xs="24" :lg="12">
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

      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>公告 / 代办</span>
            </div>
          </template>
          <el-empty description="可在此接入：待审核数量、库存预警、到期合同、系统公告等" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { parseTime } from "@/utils"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
const name = computed(() => userStore.name)

const now = ref(new Date())
const nowText = computed(() => parseTime(now.value, "{y}-{m}-{d} {h}:{i}") || "")
const todayText = computed(() => parseTime(now.value, "{y}-{m}-{d} 星期{a}") || "")
const envText = computed(() => (import.meta.env.MODE || "").toUpperCase() || "UNKNOWN")

let timer = null
onMounted(() => {
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
}
</style>
