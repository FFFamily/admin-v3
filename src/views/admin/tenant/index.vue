<template>
  <div class="tenant-page">
    <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
      <el-form-item label="关键字">
        <el-input
          v-model="query.keyword"
          placeholder="code / name"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" style="margin-left: 10px" @click="openCreate">新增租户</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      title="租户管理为平台能力，仅平台管理员可操作。创建租户后可通过“初始化管理员”生成该租户的后台 SUPER_ADMIN 账号。"
      type="info"
      :closable="false"
      show-icon
      style="margin: 10px 0"
    />

    <el-table v-loading="loading" :data="list" border style="width: 100%; margin-top: 10px">
      <el-table-column prop="code" label="租户编码" min-width="160" />
      <el-table-column prop="name" label="租户名称" min-width="180" />

      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />

      <el-table-column label="操作" fixed="right" width="420">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="openBootstrap(row)">初始化管理员</el-button>
          <el-button link type="primary" @click="openSubscription(row)">订阅配置</el-button>

          <el-button
            v-if="row.status === 0"
            link
            type="success"
            :disabled="isDefaultTenant(row)"
            @click="changeStatus(row, 1)"
          >
            启用
          </el-button>
          <el-button
            v-else
            link
            type="warning"
            :disabled="isDefaultTenant(row)"
            @click="changeStatus(row, 0)"
          >
            停用
          </el-button>

          <el-button
            link
            type="danger"
            :disabled="isDefaultTenant(row) || row.status !== 0"
            @click="removeTenant(row)"
          >
            删除
          </el-button>
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

    <!-- 创建/编辑 -->
    <el-dialog :title="editMode ? '编辑租户' : '新增租户'" v-model="dialogVisible" width="560px" @closed="onDialogClosed">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="租户编码" prop="code">
          <el-input v-model="form.code" :disabled="editMode" placeholder="例如：default / t2 / acme" />
        </el-form-item>
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="saveTenant">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 初始化管理员 -->
    <el-dialog title="初始化租户管理员" v-model="bootstrapVisible" width="560px" @closed="onBootstrapClosed">
      <div style="margin-bottom: 10px; color: #666; font-size: 12px">
        租户：{{ bootstrapTenant?.name || '--' }}（{{ bootstrapTenant?.code || '--' }}）
      </div>
      <el-form ref="bootstrapRef" :model="bootstrapForm" :rules="bootstrapRules" label-width="110px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="bootstrapForm.username" placeholder="请输入管理员账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="bootstrapForm.password" type="password" show-password placeholder="请输入管理员密码" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="bootstrapForm.nickname" placeholder="可选" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="bootstrapForm.phone" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bootstrapVisible = false">取消</el-button>
          <el-button type="primary" :loading="bootstrapLoading" @click="doBootstrap">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 订阅配置（平台） -->
    <el-dialog title="租户订阅配置" v-model="subVisible" width="900px" @closed="onSubClosed">
      <div style="margin-bottom: 10px; color: #666; font-size: 12px">
        租户：{{ subTenant?.name || '--' }}（{{ subTenant?.code || '--' }}）
      </div>

      <el-tabs v-model="subTab" class="sub-tabs">
        <el-tab-pane label="套餐" name="packages">
          <div class="sub-toolbar">
            <el-select v-model="grantPackageForm.packageId" filterable placeholder="选择套餐" style="width: 300px">
              <el-option
                v-for="p in allPackages"
                :key="p.id"
                :label="`${p.name || '--'} (${p.code || '--'})`"
                :value="p.id"
              />
            </el-select>
            <el-date-picker
              v-model="grantPackageForm.endTimeMs"
              type="datetime"
              placeholder="到期时间(可空=永久)"
              value-format="x"
              style="width: 240px"
              clearable
            />
            <el-button type="primary" :loading="grantLoading" @click="doGrantPackage">开通/更新到期</el-button>
            <el-button :loading="subLoading" @click="refreshSub">刷新</el-button>
          </div>

          <el-table v-loading="subLoading" :data="tenantPackages" border style="width: 100%">
            <el-table-column prop="packageCode" label="编码" width="160" />
            <el-table-column prop="packageName" label="名称" min-width="180" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? "启用" : "停用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="180" />
            <el-table-column prop="endTime" label="到期时间" width="180">
              <template #default="{ row }">
                <span>{{ row.endTime || "--" }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="remainDays" label="剩余天数" width="120">
              <template #default="{ row }">
                <span>{{ row.remainDays == null ? "--" : row.remainDays }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="140">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 1"
                  link
                  type="warning"
                  :loading="row._changing"
                  @click="changePkgStatus(row, 0)"
                >
                  停用
                </el-button>
                <el-button
                  v-else
                  link
                  type="success"
                  :loading="row._changing"
                  @click="changePkgStatus(row, 1)"
                >
                  启用
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  getTenantPage,
  createTenant,
  updateTenant,
  changeTenantStatus,
  deleteTenant,
  bootstrapTenantAdmin
} from "@/api/admin/tenant"
import { getAllPackages } from "@/api/admin/package"
import {
  getTenantPackages,
  grantTenantPackage,
  changeTenantPackageStatus
} from "@/api/admin/tenantSubscription"

const loading = ref(false)
const saveLoading = ref(false)
const bootstrapLoading = ref(false)

const query = reactive({
  current: 1,
  size: 10,
  keyword: "",
  status: undefined
})

const list = ref([])
const total = ref(0)

function isDefaultTenant(row) {
  return String(row?.id || "") === "t1" || String(row?.code || "") === "default"
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getTenantPage({ ...query })
    const page = res?.data
    list.value = page?.records || []
    total.value = page?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.current = 1
  fetchList()
}

function handleReset() {
  query.current = 1
  query.size = 10
  query.keyword = ""
  query.status = undefined
  fetchList()
}

// create / edit
const dialogVisible = ref(false)
const editMode = ref(false)
const formRef = ref()

const form = reactive({
  id: "",
  code: "",
  name: "",
  status: 1,
  remark: ""
})

const rules = {
  code: [{ required: true, message: "请输入租户编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入租户名称", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
}

function openCreate() {
  editMode.value = false
  form.id = ""
  form.code = ""
  form.name = ""
  form.status = 1
  form.remark = ""
  dialogVisible.value = true
}

function openEdit(row) {
  editMode.value = true
  form.id = row?.id || ""
  form.code = row?.code || ""
  form.name = row?.name || ""
  form.status = row?.status ?? 1
  form.remark = row?.remark || ""
  dialogVisible.value = true
}

function onDialogClosed() {
  formRef.value?.resetFields?.()
}

async function saveTenant() {
  if (!formRef.value) return
  await formRef.value.validate()
  saveLoading.value = true
  try {
    if (editMode.value) {
      await updateTenant({ id: form.id, name: form.name, status: form.status, remark: form.remark })
      ElMessage.success("更新成功")
    } else {
      await createTenant({ code: form.code, name: form.name, status: form.status, remark: form.remark })
      ElMessage.success("创建成功")
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    saveLoading.value = false
  }
}

async function changeStatus(row, nextStatus) {
  if (isDefaultTenant(row)) return
  const label = nextStatus === 1 ? "启用" : "停用"
  await ElMessageBox.confirm(`确定要${label}租户【${row.name}】吗？`, "提示", { type: "warning" })
  await changeTenantStatus(row.id, nextStatus)
  ElMessage.success("操作成功")
  fetchList()
}

async function removeTenant(row) {
  if (isDefaultTenant(row)) return
  await ElMessageBox.confirm(
    `确定要删除租户【${row.name}】吗？仅允许删除已停用的租户。`,
    "危险操作",
    { type: "warning" }
  )
  await deleteTenant(row.id)
  ElMessage.success("删除成功")
  fetchList()
}

// bootstrap admin
const bootstrapVisible = ref(false)
const bootstrapTenant = ref(null)
const bootstrapRef = ref()
const bootstrapForm = reactive({
  username: "",
  password: "",
  nickname: "",
  phone: ""
})
const bootstrapRules = {
  username: [{ required: true, message: "请输入管理员账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入管理员密码", trigger: "blur" }]
}

function openBootstrap(row) {
  bootstrapTenant.value = row
  bootstrapForm.username = ""
  bootstrapForm.password = ""
  bootstrapForm.nickname = ""
  bootstrapForm.phone = ""
  bootstrapVisible.value = true
}

function onBootstrapClosed() {
  bootstrapRef.value?.resetFields?.()
  bootstrapTenant.value = null
}

async function doBootstrap() {
  if (!bootstrapRef.value || !bootstrapTenant.value) return
  await bootstrapRef.value.validate()
  bootstrapLoading.value = true
  try {
    const res = await bootstrapTenantAdmin(bootstrapTenant.value.id, { ...bootstrapForm })
    const userId = res?.data
    ElMessage.success(`初始化成功（管理员ID：${userId || "--"}）`)
    bootstrapVisible.value = false
  } finally {
    bootstrapLoading.value = false
  }
}

onMounted(fetchList)

// subscription config
const subVisible = ref(false)
const subTenant = ref(null)
const subTab = ref("packages")
const subLoading = ref(false)
const grantLoading = ref(false)

const allPackages = ref([])
const tenantPackages = ref([])

const grantPackageForm = reactive({
  packageId: "",
  endTimeMs: ""
})

async function openSubscription(row) {
  subTenant.value = row
  subVisible.value = true
  // lazy-load everything needed for both tabs
  await refreshSub()
}

function onSubClosed() {
  subTenant.value = null
  subTab.value = "packages"
  tenantPackages.value = []
  allPackages.value = []
  grantPackageForm.packageId = ""
  grantPackageForm.endTimeMs = ""
}

async function refreshSub() {
  if (!subTenant.value?.id) return
  subLoading.value = true
  try {
    const [pkgAllRes, pkgRes] = await Promise.allSettled([
      getAllPackages({ status: 1 }),
      getTenantPackages(subTenant.value.id)
    ])
    allPackages.value = pkgAllRes.status === "fulfilled" ? pkgAllRes.value?.data || [] : []
    tenantPackages.value = pkgRes.status === "fulfilled" ? pkgRes.value?.data || [] : []
  } finally {
    subLoading.value = false
  }
}

async function doGrantPackage() {
  if (!subTenant.value?.id) return
  if (!grantPackageForm.packageId) {
    ElMessage.warning("请选择套餐")
    return
  }
  grantLoading.value = true
  try {
    await grantTenantPackage(subTenant.value.id, {
      packageId: grantPackageForm.packageId,
      endTimeMs: grantPackageForm.endTimeMs ? Number(grantPackageForm.endTimeMs) : null
    })
    ElMessage.success("操作成功")
    refreshSub()
  } finally {
    grantLoading.value = false
  }
}

async function changePkgStatus(row, status) {
  if (!subTenant.value?.id) return
  row._changing = true
  try {
    await changeTenantPackageStatus(subTenant.value.id, row.packageId, status)
    ElMessage.success("操作成功")
    refreshSub()
  } finally {
    row._changing = false
  }
}
</script>

<style scoped>
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.sub-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
</style>
