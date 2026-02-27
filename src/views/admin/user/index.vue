<template>
  <div class="admin-user-page">
    <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
      <el-form-item label="关键字">
        <el-input
          v-model="query.keyword"
          placeholder="username / nickname"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
          <el-option label="使用中" value="use" />
          <el-option label="已关闭" value="disable" />
        </el-select>
      </el-form-item>

      <el-form-item label="部门">
        <el-tree-select
          v-model="query.deptId"
          :data="deptTree"
          :props="deptTreeProps"
          check-strictly
          clearable
          filterable
          placeholder="全部"
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-permission="'user:create'" type="success" style="margin-left: 10px" @click="handleAdd">新增用户</el-button>
        <el-button
          v-permission="'user:delete'"
          type="danger"
          :disabled="!selectedIds.length"
          style="margin-left: 10px"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      style="width: 100%; margin-top: 10px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column prop="username" label="登录账号" width="160" />
      <el-table-column prop="nickname" label="用户昵称" width="160" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="deptName" label="部门" min-width="160" />
      <el-table-column label="头像" width="90">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :src="row.avatar" size="small" />
          <el-avatar v-else size="small" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 'use' ? 'success' : 'danger'">
            {{ row.status === "use" ? "使用中" : "已关闭" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="420">
        <template #default="{ row }">
          <el-button v-permission="'user:read'" link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button v-permission="'user:update'" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button v-permission="'role:bind_users'" link type="primary" @click="openRoleDialog(row)">分配角色</el-button>
          <el-button v-permission="'user:reset_password'" link type="primary" @click="openResetPwdDialog(row)">重置密码</el-button>

          <el-button
            v-if="row.status === 'disable'"
            v-permission="'user:update'"
            link
            type="success"
            @click="handleEnable(row)"
          >
            启用
          </el-button>
          <el-button
            v-else
            v-permission="'user:update'"
            link
            type="warning"
            @click="handleDisable(row)"
          >
            停用
          </el-button>

          <el-button v-permission="'user:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="620px" @closed="onDialogClosed">
      <el-form ref="formRef" :model="form" :rules="isEdit ? updateRules : createRules" label-width="100px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" :disabled="isEdit" />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入初始密码" show-password />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptTree"
            :props="deptTreeProps"
            check-strictly
            clearable
            filterable
            placeholder="请选择部门"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="头像" prop="avatar">
          <ImageUploader
            v-model="form.avatar"
            :multiple="false"
            :limit="1"
            list-type="picture-card"
            tips="支持 JPG、PNG、GIF 格式，大小不超过 2MB"
            @success="handleAvatarSuccess"
          />
        </el-form-item>

        <el-form-item label="用户状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择用户状态" style="width: 100%">
            <el-option label="使用中" value="use" />
            <el-option label="已关闭" value="disable" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="用户详情" size="520px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="登录账号">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ detail.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ detail.deptName || formatDeptName(detail.deptId) }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <span v-if="detailRoleNames.length">{{ detailRoleNames.join('，') }}</span>
          <span v-else>--</span>
        </el-descriptions-item>
      </el-descriptions>
      <div v-else style="color: #999">暂无数据</div>
    </el-drawer>

    <!-- 分配角色 -->
    <el-dialog title="分配角色" v-model="roleDialogVisible" width="560px">
      <div style="margin-bottom: 10px; color: #666; font-size: 12px">
        用户：{{ roleDialogUser?.nickname || roleDialogUser?.username || '--' }}
      </div>
      <el-select v-model="roleDialogRoleIds" multiple filterable clearable placeholder="请选择角色" style="width: 100%">
        <el-option
          v-for="r in roleOptions"
          :key="r.id"
          :label="`${r.name}${r.code ? ' (' + r.code + ')' : ''}`"
          :value="r.id"
        />
      </el-select>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="roleSaveLoading" @click="saveRoles">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码 -->
    <el-dialog title="重置密码" v-model="resetPwdVisible" width="520px">
      <el-form ref="resetPwdRef" :model="resetPwdForm" :rules="resetPwdRules" label-width="110px">
        <el-form-item label="用户" prop="userId">
          <el-input :model-value="resetPwdUserLabel" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPwdVisible = false">取消</el-button>
          <el-button type="primary" :loading="resetPwdLoading" @click="saveResetPassword">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import ImageUploader from "@/components/ImageUploader/index.vue"
import {
  batchDeleteAdminUsers,
  changeAdminUserStatus,
  createAdminUser,
  deleteAdminUser,
  getAdminUserInfo,
  getAdminUserPage,
  resetAdminUserPassword,
  setAdminUserRoles,
  updateAdminUser
} from "@/api/admin/user"
import { getAllEnabledRoles } from "@/api/admin/role"
import { getDepartmentTree } from "@/api/admin/department"

function flattenTree(list, childrenKey = "children") {
  const out = []
  const walk = arr => {
    ;(arr || []).forEach(n => {
      out.push(n)
      if (n && n[childrenKey] && n[childrenKey].length) walk(n[childrenKey])
    })
  }
  walk(list)
  return out
}

export default {
  name: "AdminUserPage",
  components: { ImageUploader },
  data() {
    return {
      loading: false,
      saveLoading: false,
      list: [],
      total: 0,
      selectedIds: [],

      query: {
        current: 1,
        size: 10,
        keyword: "",
        status: "",
        deptId: ""
      },

      deptTree: [],
      deptFlat: [],
      deptTreeProps: { value: "id", label: "name", children: "children" },

      dialogVisible: false,
      dialogTitle: "",
      isEdit: false,
      form: this.getEmptyForm(),
      createRules: {
        username: [
          { required: true, message: "请输入登录账号", trigger: "blur" },
          { min: 3, max: 20, message: "账号长度在 3 到 20 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入初始密码", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" }
        ],
        nickname: [
          { required: true, message: "请输入用户昵称", trigger: "blur" },
          { min: 2, max: 20, message: "昵称长度在 2 到 20 个字符", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的11位手机号", trigger: "blur" }
        ],
        status: [{ required: true, message: "请选择用户状态", trigger: "change" }]
      },
      updateRules: {
        nickname: [
          { required: true, message: "请输入用户昵称", trigger: "blur" },
          { min: 2, max: 20, message: "昵称长度在 2 到 20 个字符", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的11位手机号", trigger: "blur" }
        ],
        status: [{ required: true, message: "请选择用户状态", trigger: "change" }]
      },

      detailVisible: false,
      detail: null,

      roleOptions: [],
      roleDialogVisible: false,
      roleDialogUser: null,
      roleDialogRoleIds: [],
      roleSaveLoading: false,

      resetPwdVisible: false,
      resetPwdLoading: false,
      resetPwdUser: null,
      resetPwdForm: { userId: "", newPassword: "" },
      resetPwdRules: {
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" }
        ]
      }
    }
  },
  computed: {
    resetPwdUserLabel() {
      const u = this.resetPwdUser
      if (!u) return "--"
      return `${u.nickname || u.username || ""} (${u.username || "--"})`
    },
    detailRoleNames() {
      const roles = this.detail?.adRoles || this.detail?.roles || this.detail?.roleList || []
      return (roles || []).map(r => r?.name).filter(Boolean)
    }
  },
  created() {
    this.bootstrap()
  },
  methods: {
    getEmptyForm() {
      return {
        id: "",
        username: "",
        password: "",
        nickname: "",
        phone: "",
        avatar: "",
        status: "use",
        deptId: ""
      }
    },
    async bootstrap() {
      await Promise.all([this.fetchDeptTree(), this.fetchRoleOptions()])
      this.fetchList()
    },
    async fetchDeptTree() {
      try {
        const res = await getDepartmentTree()
        this.deptTree = res?.data || []
        this.deptFlat = flattenTree(this.deptTree, this.deptTreeProps.children)
      } catch (e) {
        this.deptTree = []
        this.deptFlat = []
      }
    },
    async fetchRoleOptions() {
      try {
        const res = await getAllEnabledRoles()
        this.roleOptions = res?.data || []
      } catch (e) {
        this.roleOptions = []
      }
    },
    formatDeptName(deptId) {
      if (!deptId) return "--"
      const d = this.deptFlat.find(x => String(x.id) === String(deptId))
      return d?.name || "--"
    },
    async fetchList() {
      this.loading = true
      try {
        const params = {
          current: this.query.current,
          size: this.query.size,
          keyword: this.query.keyword || undefined,
          status: this.query.status || undefined,
          deptId: this.query.deptId || undefined
        }
        const res = await getAdminUserPage(params)
        const page = res?.data || {}
        const records = page.records || []
        this.list = records.map(u => ({
          ...u,
          deptName: u.deptName || this.formatDeptName(u.deptId)
        }))
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
      this.query = { current: 1, size: 10, keyword: "", status: "", deptId: "" }
      this.selectedIds = []
      this.fetchList()
    },
    handleSelectionChange(rows) {
      this.selectedIds = (rows || []).map(r => r.id).filter(Boolean)
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = "新增用户"
      this.form = this.getEmptyForm()
      this.dialogVisible = true
    },
    async handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = "编辑用户"
      this.dialogVisible = true
      // Prefer loading detail so role/dept info is correct.
      try {
        const res = await getAdminUserInfo(row.id)
        const d = res?.data || row
        this.form = { ...this.getEmptyForm(), ...d, id: d.id || row.id, password: "" }
      } catch (e) {
        this.form = { ...this.getEmptyForm(), ...row, password: "" }
      }
    },
    onDialogClosed() {
      const formRef = this.$refs.formRef
      if (formRef?.clearValidate) formRef.clearValidate()
    },
    handleAvatarSuccess(url) {
      this.form.avatar = url
    },
    handleSave() {
      const formRef = this.$refs.formRef
      if (!formRef) return
      formRef.validate(async valid => {
        if (!valid) return
        this.saveLoading = true
        try {
          if (this.isEdit) {
            await updateAdminUser({ ...this.form })
            this.$message.success("更新成功")
          } else {
            const res = await createAdminUser({ ...this.form })
            // Best-effort: if backend returns id, keep it for follow-up actions.
            const id = res?.data?.id || res?.data
            if (id) this.form.id = id
            this.$message.success("创建成功")
          }
          this.dialogVisible = false
          this.fetchList()
        } finally {
          this.saveLoading = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm("确认删除该用户吗？", "提示", { type: "warning" })
        .then(async () => {
          await deleteAdminUser(row.id)
          this.$message.success("删除成功")
          this.fetchList()
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selectedIds.length) return
      this.$confirm(`确认删除选中的 ${this.selectedIds.length} 个用户吗？`, "提示", { type: "warning" })
        .then(async () => {
          await batchDeleteAdminUsers(this.selectedIds)
          this.$message.success("删除成功")
          this.selectedIds = []
          this.fetchList()
        })
        .catch(() => {})
    },
    handleEnable(row) {
      this.$confirm("确认启用该用户吗？", "提示", { type: "warning" })
        .then(async () => {
          await changeAdminUserStatus(row.id, "use")
          this.$message.success("启用成功")
          this.fetchList()
        })
        .catch(() => {})
    },
    handleDisable(row) {
      this.$confirm("确认停用该用户吗？", "提示", { type: "warning" })
        .then(async () => {
          await changeAdminUserStatus(row.id, "disable")
          this.$message.success("停用成功")
          this.fetchList()
        })
        .catch(() => {})
    },
    async openDetail(row) {
      this.detailVisible = true
      this.detail = null
      try {
        const res = await getAdminUserInfo(row.id)
        const d = res?.data || null
        if (d && !d.deptName) d.deptName = this.formatDeptName(d.deptId)
        this.detail = d
      } catch (e) {
        this.detail = null
      }
    },
    async openRoleDialog(row) {
      this.roleDialogUser = row
      this.roleDialogRoleIds = []
      this.roleDialogVisible = true
      // Best-effort: load current roles from detail.
      try {
        const res = await getAdminUserInfo(row.id)
        const d = res?.data || {}
        const roles = d.adRoles || d.roles || d.roleList || []
        this.roleDialogRoleIds = (roles || []).map(r => r?.id).filter(Boolean)
      } catch (e) {
        // ignore
      }
    },
    async saveRoles() {
      if (!this.roleDialogUser?.id) return
      this.roleSaveLoading = true
      try {
        await setAdminUserRoles(this.roleDialogUser.id, this.roleDialogRoleIds)
        this.$message.success("保存成功")
        this.roleDialogVisible = false
        this.fetchList()
      } finally {
        this.roleSaveLoading = false
      }
    },
    openResetPwdDialog(row) {
      this.resetPwdUser = row
      this.resetPwdForm = { userId: row.id, newPassword: "" }
      this.resetPwdVisible = true
      this.$nextTick(() => {
        const ref = this.$refs.resetPwdRef
        if (ref?.clearValidate) ref.clearValidate()
      })
    },
    saveResetPassword() {
      const ref = this.$refs.resetPwdRef
      if (!ref) return
      ref.validate(async valid => {
        if (!valid) return
        this.resetPwdLoading = true
        try {
          await resetAdminUserPassword(this.resetPwdForm.userId, this.resetPwdForm.newPassword)
          this.$message.success("重置成功")
          this.resetPwdVisible = false
        } finally {
          this.resetPwdLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.admin-user-page {
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
