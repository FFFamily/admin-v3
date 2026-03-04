<template>
  <div class="package-page">
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
        <el-button type="success" style="margin-left: 10px" @click="openCreate">新增套餐</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      title="套餐为平台能力：套餐绑定“权限点”，租户开通套餐后，其用户实际权限 = 角色权限 ∩ 套餐权限并集。"
      type="info"
      :closable="false"
      show-icon
      style="margin: 10px 0"
    />

    <el-table v-loading="loading" :data="list" border style="width: 100%; margin-top: 10px">
      <el-table-column prop="code" label="套餐编码" width="160" />
      <el-table-column prop="name" label="套餐名称" min-width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="90" />
      <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="更新时间" width="180" />

      <el-table-column label="操作" fixed="right" width="260">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="openBindPerm(row)">绑定权限</el-button>
          <el-button link type="danger" @click="removePackage(row)">删除</el-button>
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

    <!-- 新增/编辑 -->
    <el-dialog :title="editMode ? '编辑套餐' : '新增套餐'" v-model="dialogVisible" width="620px" @closed="onDialogClosed">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="套餐编码" prop="code">
          <el-input v-model="form.code" :disabled="editMode" placeholder="例如：basic / pro" />
        </el-form-item>
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="savePackage">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 绑定权限 -->
    <el-dialog title="绑定权限点" v-model="permDialogVisible" width="760px">
      <div style="margin-bottom: 10px; color: #666; font-size: 12px">
        套餐：{{ bindPackage?.name || '--' }}（{{ bindPackage?.code || '--' }}）
      </div>
      <el-skeleton v-if="permLoading" :rows="6" animated />
      <el-tree
        v-else
        ref="permTreeRef"
        :data="permTree"
        :props="permTreeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :check-strictly="false"
        style="border: 1px solid #ebeef5; padding: 10px; border-radius: 6px; max-height: 520px; overflow: auto"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="permSaveLoading" @click="saveBindPerm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { getPackagePage, createPackage, updatePackage, deletePackage, getPackagePermissionIds, setPackagePermissionIds } from "@/api/admin/package"
import { getPermissionTree } from "@/api/admin/permission"

const loading = ref(false)
const saveLoading = ref(false)

const query = reactive({
  current: 1,
  size: 10,
  keyword: "",
  status: undefined
})

const list = ref([])
const total = ref(0)

async function fetchList() {
  loading.value = true
  try {
    const res = await getPackagePage({ ...query })
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

// create/edit
const dialogVisible = ref(false)
const editMode = ref(false)
const formRef = ref()

const form = reactive({
  id: "",
  code: "",
  name: "",
  status: 1,
  sortOrder: 0,
  remark: ""
})

const rules = {
  code: [{ required: true, message: "请输入套餐编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
}

function openCreate() {
  editMode.value = false
  form.id = ""
  form.code = ""
  form.name = ""
  form.status = 1
  form.sortOrder = 0
  form.remark = ""
  dialogVisible.value = true
}

function openEdit(row) {
  editMode.value = true
  form.id = row?.id || ""
  form.code = row?.code || ""
  form.name = row?.name || ""
  form.status = row?.status ?? 1
  form.sortOrder = row?.sortOrder ?? 0
  form.remark = row?.remark || ""
  dialogVisible.value = true
}

function onDialogClosed() {
  formRef.value?.resetFields?.()
}

async function savePackage() {
  if (!formRef.value) return
  await formRef.value.validate()
  saveLoading.value = true
  try {
    const payload = {
      id: form.id,
      code: form.code,
      name: form.name,
      status: form.status,
      sortOrder: form.sortOrder,
      remark: form.remark
    }
    if (editMode.value) {
      await updatePackage(payload)
      ElMessage.success("更新成功")
    } else {
      await createPackage(payload)
      ElMessage.success("创建成功")
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    saveLoading.value = false
  }
}

async function removePackage(row) {
  await ElMessageBox.confirm(`确定要删除套餐【${row?.name || row?.code || "--"}】吗？`, "危险操作", { type: "warning" })
  await deletePackage(row.id)
  ElMessage.success("删除成功")
  fetchList()
}

// bind permissions
const permDialogVisible = ref(false)
const permLoading = ref(false)
const permSaveLoading = ref(false)
const bindPackage = ref(null)
const permTree = ref([])
const permTreeRef = ref()
const permTreeProps = { label: "name", children: "children" }

async function openBindPerm(row) {
  bindPackage.value = row
  permDialogVisible.value = true
  permLoading.value = true
  try {
    const [treeRes, idsRes] = await Promise.all([getPermissionTree(), getPackagePermissionIds(row.id)])
    permTree.value = treeRes?.data || []
    const checkedIds = idsRes?.data || []
    permTreeRef.value?.setCheckedKeys?.(checkedIds)
  } finally {
    permLoading.value = false
  }
}

async function saveBindPerm() {
  if (!bindPackage.value) return
  permSaveLoading.value = true
  try {
    const tree = permTreeRef.value
    const checked = tree?.getCheckedKeys?.(false) || []
    const half = tree?.getHalfCheckedKeys?.() || []
    const ids = Array.from(new Set([...(checked || []), ...(half || [])]))
    await setPackagePermissionIds(bindPackage.value.id, ids)
    ElMessage.success("保存成功")
    permDialogVisible.value = false
  } finally {
    permSaveLoading.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>

