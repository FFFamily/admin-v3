<template>
  <div class="admin-role-users-page">
    <div class="header">
      <div class="title">
        分配人员
        <span v-if="role" class="sub">
          （{{ role.name }}{{ role.code ? " / " + role.code : "" }}）
        </span>
      </div>
      <div class="actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" :loading="loading" @click="fetchAll">刷新</el-button>
      </div>
    </div>

    <el-alert
      v-if="isSuperAdmin"
      title="SUPER_ADMIN 角色不允许分配/移除人员"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 10px"
    />

    <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
      <el-form-item label="关键字">
        <el-input
          v-model="query.keyword"
          placeholder="username / nickname / phone"
          clearable
          style="width: 260px"
          @keyup.enter="applyFilter"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="applyFilter">搜索</el-button>
        <el-button @click="resetFilter">重置</el-button>
        <el-button
          v-permission="'role:update'"
          type="success"
          style="margin-left: 10px"
          :disabled="isSuperAdmin"
          @click="openAddDialog"
        >
          添加人员
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="pagedList" border style="width: 100%; margin-top: 10px">
      <el-table-column prop="username" label="登录账号" width="160" />
      <el-table-column prop="nickname" label="用户昵称" width="160" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="deptName" label="部门" min-width="160" />
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 'use' ? 'success' : 'danger'">
            {{ row.status === "use" ? "使用中" : "已关闭" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="120">
        <template #default="{ row }">
          <el-button
            v-permission="'role:update'"
            link
            type="danger"
            :disabled="isSuperAdmin"
            @click="removeUser(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredList.length"
        :page-sizes="[10, 20, 50, 100]"
        v-model:current-page="query.current"
        v-model:page-size="query.size"
      />
    </div>

    <!-- 添加人员 -->
    <el-dialog title="添加人员" v-model="addDialogVisible" width="880px" @closed="onAddDialogClosed">
      <el-form :inline="true" :model="addQuery" class="query-form" @submit.prevent>
        <el-form-item label="关键字">
          <el-input
            v-model="addQuery.keyword"
            placeholder="username / nickname"
            clearable
            style="width: 240px"
            @keyup.enter="fetchUserPage"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="addQuery.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="使用中" value="use" />
            <el-option label="已关闭" value="disable" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="addLoading" @click="fetchUserPage">搜索</el-button>
          <el-button :disabled="addLoading" @click="resetAddQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="addLoading"
        :data="addUserList"
        border
        style="width: 100%; margin-top: 10px"
        @selection-change="onAddSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="username" label="登录账号" width="160" />
        <el-table-column prop="nickname" label="用户昵称" width="160" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="deptName" label="部门" min-width="160" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'use' ? 'success' : 'danger'">
              {{ row.status === "use" ? "使用中" : "已关闭" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager" style="margin-top: 10px">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="addTotal"
          :page-sizes="[10, 20, 50, 100]"
          v-model:current-page="addQuery.current"
          v-model:page-size="addQuery.size"
          @size-change="fetchUserPage"
          @current-change="fetchUserPage"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div style="flex: 1; color: #666; font-size: 12px">
            已选择 {{ addSelectedIds.length }} 人
          </div>
          <el-button :disabled="addSaving" @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="addSaving" :disabled="!addSelectedIds.length" @click="saveAddUsers">
            确定添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { getAdminRoleInfo, getRolesByUserId } from "@/api/admin/role"
import { getAdminUserPage, getUsersByRole, setAdminUserRoles } from "@/api/admin/user"

const route = useRoute()
const router = useRouter()

const roleId = computed(() => route.params.id)

const loading = ref(false)
const role = ref(null)
const userList = ref([])

const query = ref({
  current: 1,
  size: 10,
  keyword: ""
})

const filteredList = computed(() => {
  const kw = String(query.value.keyword || "").trim().toLowerCase()
  if (!kw) return userList.value || []
  return (userList.value || []).filter(u => {
    const s = `${u.username || ""} ${u.nickname || ""} ${u.phone || ""}`.toLowerCase()
    return s.includes(kw)
  })
})

const pagedList = computed(() => {
  const cur = Number(query.value.current || 1)
  const size = Number(query.value.size || 10)
  const start = (cur - 1) * size
  return filteredList.value.slice(start, start + size)
})

const isSuperAdmin = computed(() => String(role.value?.code || "").toUpperCase() === "SUPER_ADMIN")

const fetchAll = async () => {
  const id = roleId.value
  if (!id) return
  loading.value = true
  try {
    const [roleRes, usersRes] = await Promise.allSettled([getAdminRoleInfo(id), getUsersByRole(id)])
    role.value = roleRes.status === "fulfilled" ? roleRes.value?.data || null : null
    if (usersRes.status === "fulfilled") {
      const data = usersRes.value?.data
      userList.value = Array.isArray(data) ? data : data?.records || []
    } else {
      userList.value = []
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const applyFilter = () => {
  query.value.current = 1
}

const resetFilter = () => {
  query.value = { current: 1, size: 10, keyword: "" }
}

// ---------- Add dialog ----------
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addSaving = ref(false)
const addUserList = ref([])
const addTotal = ref(0)
const addSelectedIds = ref([])

const addQuery = ref({
  current: 1,
  size: 10,
  keyword: "",
  status: ""
})

const openAddDialog = () => {
  addDialogVisible.value = true
  resetAddQuery()
  fetchUserPage()
}

const onAddDialogClosed = () => {
  addSelectedIds.value = []
}

const resetAddQuery = () => {
  addQuery.value = { current: 1, size: 10, keyword: "", status: "" }
  addSelectedIds.value = []
}

const onAddSelectionChange = rows => {
  addSelectedIds.value = (rows || []).map(r => r.id).filter(Boolean)
}

const fetchUserPage = async () => {
  addLoading.value = true
  try {
    const params = {
      current: addQuery.value.current,
      size: addQuery.value.size,
      keyword: addQuery.value.keyword || undefined,
      status: addQuery.value.status || undefined
    }
    const res = await getAdminUserPage(params)
    const page = res?.data || {}
    const records = page.records || []
    // Avoid re-adding existing role users in the dialog list (still show them, but user will be no-op on save).
    addUserList.value = records
    addTotal.value = page.total || 0
  } catch (e) {
    addUserList.value = []
    addTotal.value = 0
  } finally {
    addLoading.value = false
  }
}

function normalizeRoleIds(data) {
  if (Array.isArray(data)) return data.map(r => (typeof r === "string" ? r : r?.id)).filter(Boolean).map(String)
  return []
}

const saveAddUsers = async () => {
  const id = roleId.value
  if (!id) return
  if (!addSelectedIds.value.length) return

  addSaving.value = true
  try {
    for (const userId of addSelectedIds.value) {
      const rolesRes = await getRolesByUserId(userId)
      const roleIds = normalizeRoleIds(rolesRes?.data)
      const rid = String(id)
      if (roleIds.includes(rid)) continue
      await setAdminUserRoles(userId, Array.from(new Set([...roleIds, rid])))
    }
    addDialogVisible.value = false
    await fetchAll()
  } finally {
    addSaving.value = false
  }
}

// ---------- Remove ----------
const removeUserImpl = async row => {
  const id = roleId.value
  if (!id || !row?.id) return
  if (isSuperAdmin.value) {
    ElMessage.warning("SUPER_ADMIN 角色不可移除人员")
    return
  }
  try {
    await ElMessageBox.confirm(`确认将「${row.nickname || row.username || "--"}」从该角色中移除吗？`, "提示", {
      type: "warning"
    })
  } catch {
    return
  }

  loading.value = true
  try {
    const rolesRes = await getRolesByUserId(row.id)
    const roleIds = normalizeRoleIds(rolesRes?.data)
    const rid = String(id)
    const next = roleIds.filter(x => String(x) !== rid)
    await setAdminUserRoles(row.id, next)
    ElMessage.success("移除成功")
    await fetchAll()
  } finally {
    loading.value = false
  }
}

// Keep template binding stable.
const removeUser = row => removeUserImpl(row)

onMounted(() => fetchAll())
</script>

<style scoped>
.admin-role-users-page {
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.sub {
  font-size: 12px;
  font-weight: 400;
  color: #666;
}
.query-form {
  margin-bottom: 6px;
}
.pager {
  margin-top: 16px;
  text-align: right;
}
.dialog-footer {
  display: flex;
  align-items: center;
}
</style>
