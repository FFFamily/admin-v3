<template>
  <div class="admin-role-detail">
    <el-card>
      <div class="header">
        <div class="title">角色详情</div>
        <div class="actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" :loading="loading" @click="fetchData">刷新</el-button>
        </div>
      </div>

      <el-skeleton v-if="loading" :rows="8" animated />
      <el-empty v-else-if="!detail" description="暂无数据" />
      <template v-else>
        <el-descriptions :column="1" border style="margin-bottom: 12px">
          <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="角色名">{{ detail.name }}</el-descriptions-item>
          <el-descriptions-item label="编码">{{ detail.code }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detail.remark || "--" }}</el-descriptions-item>
        </el-descriptions>

        <div class="sub-title">权限点</div>
        <div v-if="permTags.length" class="perm-tags">
          <el-tag v-for="p in permTags" :key="p.key" style="margin: 0 8px 8px 0">
            {{ p.label }}
          </el-tag>
        </div>
        <el-empty v-else description="暂无权限点" />
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getAdminRoleInfo } from "@/api/admin/role"
import { getPermissionsByRole } from "@/api/admin/permission"

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = ref(null)
const perms = ref([])

const roleId = computed(() => route.params.id)

const permTags = computed(() => {
  return (perms.value || []).map(p => {
    if (typeof p === "string") return { key: p, label: p }
    const code = p?.code
    const name = p?.name
    return { key: p?.id || code || name, label: name && code ? `${name} (${code})` : name || code || "--" }
  })
})

const fetchData = async () => {
  const id = roleId.value
  if (!id) return
  loading.value = true
  try {
    const [roleRes, permRes] = await Promise.allSettled([getAdminRoleInfo(id), getPermissionsByRole(id)])
    detail.value = roleRes.status === "fulfilled" ? roleRes.value?.data || null : null
    perms.value = permRes.status === "fulfilled" ? permRes.value?.data || [] : []
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

watch(roleId, () => fetchData())
onMounted(() => fetchData())
</script>

<style scoped>
.admin-role-detail {
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
.sub-title {
  font-size: 14px;
  font-weight: 600;
  margin: 8px 0;
}
.perm-tags {
  display: flex;
  flex-wrap: wrap;
}
</style>

