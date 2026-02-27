<template>
  <div class="admin-user-detail">
    <el-card>
      <div class="header">
        <div class="title">用户详情</div>
        <div class="actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" :loading="loading" @click="fetchData">刷新</el-button>
        </div>
      </div>

      <el-skeleton v-if="loading" :rows="8" animated />
      <el-empty v-else-if="!detail" description="暂无数据" />
      <template v-else>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">{{ detail.username }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ detail.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ detail.deptName || detail.deptId || "--" }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <span v-if="roleNames.length">{{ roleNames.join("，") }}</span>
            <span v-else>--</span>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getAdminUserInfo } from "@/api/admin/user"

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = ref(null)

const userId = computed(() => route.params.id)
const roleNames = computed(() => {
  const roles = detail.value?.adRoles || detail.value?.roles || detail.value?.roleList || []
  return (roles || []).map(r => r?.name).filter(Boolean)
})

const fetchData = async () => {
  const id = userId.value
  if (!id) return
  loading.value = true
  try {
    const res = await getAdminUserInfo(id)
    detail.value = res?.data || null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

watch(userId, () => fetchData())
onMounted(() => fetchData())
</script>

<style scoped>
.admin-user-detail {
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
</style>

