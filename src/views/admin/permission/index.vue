<template>
  <div class="admin-permission-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="权限点列表" name="list">
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

          <el-form-item label="类型">
            <el-select v-model="query.type" placeholder="全部" clearable style="width: 140px">
              <el-option label="菜单" :value="1" />
              <el-option label="按钮" :value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button v-permission="'permission:create'" type="success" style="margin-left: 10px" @click="handleAdd">
              新增权限
            </el-button>
            <el-button
              v-permission="'permission:delete'"
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
          <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="code" label="编码" min-width="200" show-overflow-tooltip />

          <el-table-column prop="type" label="类型" width="90">
            <template #default="{ row }">
              <el-tag :type="row.type === 1 ? 'success' : 'info'">
                {{ row.type === 1 ? "菜单" : "按钮" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-switch
                v-permission="'permission:update'"
                :model-value="Number(row.status) === 1"
                @change="val => handleToggleStatus(row, val)"
              />
            </template>
          </el-table-column>

          <el-table-column label="父级" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatParentName(row.parentId) }}
            </template>
          </el-table-column>

          <el-table-column prop="path" label="路由" min-width="160" show-overflow-tooltip />
          <el-table-column prop="component" label="组件" min-width="160" show-overflow-tooltip />
          <el-table-column prop="icon" label="图标" min-width="120" show-overflow-tooltip />
          <el-table-column prop="sortOrder" label="排序" width="90" />
          <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />

          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button v-permission="'permission:update'" link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button v-permission="'permission:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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
      </el-tab-pane>

        <el-tab-pane label="权限点树" name="tree">
          <div style="margin-bottom: 10px">
            <el-button :loading="treeLoading" @click="fetchTree">刷新</el-button>
          </div>
          <el-tree
            v-loading="treeLoading"
            :data="tree"
            node-key="id"
            :props="treeProps"
            default-expand-all
            highlight-current
          >
            <template #default="{ data }">
              <span>{{ data.name }}</span>
              <span v-if="data.code" style="margin-left: 8px; color: #999">({{ data.code }})</span>
              <el-tag size="small" :type="Number(data.type) === 1 ? 'success' : 'info'" style="margin-left: 8px">
                {{ Number(data.type) === 1 ? "菜单" : "按钮" }}
              </el-tag>
              <el-tag v-if="Number(data.status) === 0" size="small" type="warning" style="margin-left: 8px">禁用</el-tag>
            </template>
          </el-tree>
        </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="720px" @opened="onDialogOpened">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" />
        </el-form-item>

        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="如：user:list" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="父级" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="treeSelectProps"
            check-strictly
            clearable
            filterable
            placeholder="根节点"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="路由" prop="path">
          <el-input v-model="form.path" placeholder="菜单可填，如：/admin/user" />
        </el-form-item>

        <el-form-item label="组件" prop="component">
          <el-input v-model="form.component" placeholder="菜单可填，如：@/views/admin/user/index.vue" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="可选，如：user" />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" style="width: 160px" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  batchDeletePermissions,
  createPermission,
  deletePermission,
  getPermissionInfo,
  getPermissionPage,
  getPermissionTree,
  updatePermission
} from "@/api/admin/permission"

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
  name: "AdminPermissionPage",
  data() {
    const requireParentIfButton = (rule, value, callback) => {
      const type = Number(this.form?.type)
      if (type === 2 && (!value || String(value).trim() === "" || String(value) === "0")) {
        callback(new Error("按钮权限必须选择父级菜单"))
        return
      }
      callback()
    }

    return {
      activeTab: "list",
      loading: false,
      saveLoading: false,
      treeLoading: false,

      list: [],
      total: 0,
      selectedIds: [],

      query: {
        current: 1,
        size: 10,
        keyword: "",
        type: undefined,
        status: undefined
      },

      tree: [],
      treeFlat: [],
      treeProps: { label: "name", children: "children" },
      treeSelectProps: { value: "id", label: "name", children: "children" },

      dialogVisible: false,
      dialogTitle: "",
      isEdit: false,
      form: this.getEmptyForm(),
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        code: [{ required: true, message: "请输入编码", trigger: "blur" }],
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        parentId: [{ validator: requireParentIfButton, trigger: "change" }]
      }
    }
  },
  computed: {
    parentOptions() {
      // 约定：父级选择仅从“菜单节点”中选（更符合“菜单-按钮”层级）。
      return this.menuOnlyTree || []
    },
    menuOnlyTree() {
      const filterMenu = nodes => {
        return (nodes || [])
          .filter(n => Number(n?.type) === 1)
          .map(n => ({
            ...n,
            children: filterMenu(n?.children || [])
          }))
      }
      return filterMenu(this.tree || [])
    }
  },
  created() {
    this.bootstrap()
  },
  methods: {
    getEmptyForm() {
      return {
        id: "",
        name: "",
        code: "",
        type: 1,
        parentId: "",
        path: "",
        component: "",
        icon: "",
        sortOrder: 0,
        status: 1,
        remark: ""
      }
    },
    async bootstrap() {
      await this.fetchTree()
      this.fetchList()
    },
    async fetchTree() {
      this.treeLoading = true
      try {
        const res = await getPermissionTree()
        this.tree = res?.data || []
        this.treeFlat = flattenTree(this.tree, this.treeProps.children)
      } catch (e) {
        this.tree = []
        this.treeFlat = []
      } finally {
        this.treeLoading = false
      }
    },
    formatParentName(parentId) {
      const pid = parentId == null ? "" : String(parentId)
      if (!pid || pid === "0") return "根节点"
      const hit = (this.treeFlat || []).find(x => String(x.id) === pid)
      return hit?.name || pid
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getPermissionPage({
          current: this.query.current,
          size: this.query.size,
          keyword: this.query.keyword || undefined,
          type: this.query.type == null ? undefined : this.query.type,
          status: this.query.status == null ? undefined : this.query.status
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
      this.query = { current: 1, size: 10, keyword: "", type: undefined, status: undefined }
      this.selectedIds = []
      this.fetchList()
    },
    handleSelectionChange(rows) {
      this.selectedIds = (rows || []).map(r => r.id).filter(Boolean)
    },
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = "新增权限"
      this.form = this.getEmptyForm()
      this.dialogVisible = true
    },
    async handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = "编辑权限"
      this.dialogVisible = true
      try {
        const res = await getPermissionInfo(row.id)
        const d = res?.data || row
        // Normalize parentId: root = "" in UI.
        const parentId = d.parentId && String(d.parentId) !== "0" ? d.parentId : ""
        this.form = { ...this.getEmptyForm(), ...d, parentId }
      } catch (e) {
        const parentId = row.parentId && String(row.parentId) !== "0" ? row.parentId : ""
        this.form = { ...this.getEmptyForm(), ...row, parentId }
      }
    },
    onDialogOpened() {
      if (!this.tree.length) this.fetchTree()
    },
    handleSave() {
      const formRef = this.$refs.formRef
      if (!formRef) return
      formRef.validate(async valid => {
        if (!valid) return
        this.saveLoading = true
        try {
          const payload = { ...this.form }
          // Backend uses "0" as root.
          if (!payload.parentId) payload.parentId = "0"

          if (this.isEdit) {
            await updatePermission(payload)
            this.$message.success("更新成功")
          } else {
            await createPermission(payload)
            this.$message.success("创建成功")
          }
          this.dialogVisible = false
          await this.fetchTree()
          this.fetchList()
        } finally {
          this.saveLoading = false
        }
      })
    },
    async handleToggleStatus(row, enabled) {
      const next = enabled ? 1 : 0
      const prev = Number(row.status) === 1
      if (prev === enabled) return

      try {
        await updatePermission({ ...row, status: next })
        row.status = next
        this.$message.success("状态已更新")
        await this.fetchTree()
      } catch (e) {
        // revert visual switch (data-driven)
        row.status = prev ? 1 : 0
      }
    },
    handleDelete(row) {
      this.$confirm("确认删除该权限吗？", "提示", { type: "warning" })
        .then(async () => {
          await deletePermission(row.id)
          this.$message.success("删除成功")
          await this.fetchTree()
          this.fetchList()
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selectedIds.length) return
      this.$confirm(`确认删除选中的 ${this.selectedIds.length} 条权限吗？`, "提示", { type: "warning" })
        .then(async () => {
          await batchDeletePermissions(this.selectedIds)
          this.$message.success("删除成功")
          this.selectedIds = []
          await this.fetchTree()
          this.fetchList()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.admin-permission-page {
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
