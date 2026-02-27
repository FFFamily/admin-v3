<template>
  <div class="admin-role-page">
    <el-card>
      <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
        <el-form-item label="关键字">
          <el-input
            v-model="query.keyword"
            placeholder="name / code"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-permission="'role:create'" type="success" style="margin-left: 10px" @click="handleAdd">新增角色</el-button>
          <el-button
            v-permission="'role:delete'"
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
        <el-table-column prop="name" label="角色名" width="180" />
        <el-table-column prop="code" label="编码" width="180" />
        <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />

        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button v-permission="'role:update'" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="'role:bind_permissions'" link type="primary" @click="openPermDialog(row)">授权</el-button>
            <el-button
              v-permission="'role:delete'"
              link
              type="danger"
              :disabled="isAdminRole(row)"
              @click="handleDelete(row)"
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
    </el-card>

    <!-- 新增/编辑 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="560px" @closed="onDialogClosed">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="如：ADMIN" :disabled="isEdit && isAdminRole(form)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 授权（绑定权限点） -->
    <el-dialog title="角色授权" v-model="permDialogVisible" width="720px">
      <div style="margin-bottom: 10px; color: #666; font-size: 12px">
        角色：{{ permDialogRole?.name }} {{ permDialogRole?.code ? "(" + permDialogRole.code + ")" : "" }}
      </div>

      <el-tree
        ref="permTreeRef"
        :data="permTree"
        :props="permTreeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :check-strictly="false"
        style="border: 1px solid #ebeef5; padding: 10px; border-radius: 6px"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="permSaveLoading" @click="savePermissions">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  batchDeleteAdminRoles,
  bindRolePermissions,
  createAdminRole,
  deleteAdminRole,
  getAdminRolePage,
  updateAdminRole
} from "@/api/admin/role"
import { getPermissionTree, getPermissionsByRole } from "@/api/admin/permission"

export default {
  name: "AdminRolePage",
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
        keyword: ""
      },

      dialogVisible: false,
      dialogTitle: "",
      isEdit: false,
      form: this.getEmptyForm(),
      rules: {
        name: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 2, max: 30, message: "角色名长度在 2 到 30 个字符", trigger: "blur" }
        ],
        code: [
          { required: true, message: "请输入编码", trigger: "blur" },
          { min: 2, max: 30, message: "编码长度在 2 到 30 个字符", trigger: "blur" }
        ]
      },

      permDialogVisible: false,
      permDialogRole: null,
      permSaveLoading: false,
      permTree: [],
      permTreeProps: { label: "name", children: "children" }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    getEmptyForm() {
      return { id: "", name: "", code: "", remark: "" }
    },
    isAdminRole(role) {
      const code = role?.code || ""
      return String(code).toUpperCase() === "ADMIN"
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getAdminRolePage({
          current: this.query.current,
          size: this.query.size,
          keyword: this.query.keyword || undefined
        })
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
      this.query = { current: 1, size: 10, keyword: "" }
      this.selectedIds = []
      this.fetchList()
    },
    handleSelectionChange(rows) {
      this.selectedIds = (rows || []).map(r => r.id).filter(Boolean)
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = "新增角色"
      this.form = this.getEmptyForm()
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = "编辑角色"
      this.form = { ...this.getEmptyForm(), ...row }
      this.dialogVisible = true
    },
    onDialogClosed() {
      const formRef = this.$refs.formRef
      if (formRef?.clearValidate) formRef.clearValidate()
    },
    handleSave() {
      const formRef = this.$refs.formRef
      if (!formRef) return
      formRef.validate(async valid => {
        if (!valid) return
        this.saveLoading = true
        try {
          if (this.isEdit) {
            await updateAdminRole({ ...this.form })
            this.$message.success("更新成功")
          } else {
            await createAdminRole({ ...this.form })
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
      if (this.isAdminRole(row)) {
        this.$message.warning("ADMIN 角色不可删除")
        return
      }
      this.$confirm("确认删除该角色吗？", "提示", { type: "warning" })
        .then(async () => {
          await deleteAdminRole(row.id)
          this.$message.success("删除成功")
          this.fetchList()
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selectedIds.length) return
      this.$confirm(`确认删除选中的 ${this.selectedIds.length} 个角色吗？`, "提示", { type: "warning" })
        .then(async () => {
          await batchDeleteAdminRoles(this.selectedIds)
          this.$message.success("删除成功")
          this.selectedIds = []
          this.fetchList()
        })
        .catch(() => {})
    },
    async openPermDialog(row) {
      this.permDialogRole = row
      this.permDialogVisible = true
      this.permSaveLoading = false

      // Load tree + checked keys, then apply to tree instance.
      const [treeRes, checkedRes] = await Promise.allSettled([
        getPermissionTree(),
        getPermissionsByRole(row.id)
      ])
      this.permTree = treeRes.status === "fulfilled" ? treeRes.value?.data || [] : []
      const checkedList = checkedRes.status === "fulfilled" ? checkedRes.value?.data || [] : []
      const checkedIds = (checkedList || []).map(p => p?.id).filter(Boolean)

      this.$nextTick(() => {
        const tree = this.$refs.permTreeRef
        if (tree?.setCheckedKeys) tree.setCheckedKeys(checkedIds, false)
      })
    },
    async savePermissions() {
      const roleId = this.permDialogRole?.id
      if (!roleId) return
      const tree = this.$refs.permTreeRef
      if (!tree?.getCheckedKeys) return

      this.permSaveLoading = true
      try {
        const checked = tree.getCheckedKeys(false) || []
        const half = tree.getHalfCheckedKeys ? tree.getHalfCheckedKeys() || [] : []
        const permIds = Array.from(new Set([...checked, ...half]))
        await bindRolePermissions(roleId, permIds)
        this.$message.success("保存成功")
        this.permDialogVisible = false
      } finally {
        this.permSaveLoading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-role-page {
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
