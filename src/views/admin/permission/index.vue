<template>
  <div class="admin-permission-page">
    <el-card>
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
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button v-permission="'permission:create'" type="success" style="margin-left: 10px" @click="handleAdd">新增权限</el-button>
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
            <el-table-column prop="name" label="名称" min-width="180" />
            <el-table-column prop="code" label="编码" min-width="200" />
            <el-table-column prop="parentId" label="父级" width="120" />
            <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="160">
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

        <el-tab-pane label="菜单权限树" name="tree">
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
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增/编辑 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="620px" @opened="onDialogOpened">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="如：user:list" />
        </el-form-item>
        <el-form-item label="父级" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="tree"
            :props="treeSelectProps"
            check-strictly
            clearable
            filterable
            placeholder="可选"
            style="width: 100%"
          />
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

export default {
  name: "AdminPermissionPage",
  data() {
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
        keyword: ""
      },

      tree: [],
      treeProps: { label: "name", children: "children" },
      treeSelectProps: { value: "id", label: "name", children: "children" },

      dialogVisible: false,
      dialogTitle: "",
      isEdit: false,
      form: this.getEmptyForm(),
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        code: [{ required: true, message: "请输入编码", trigger: "blur" }]
      }
    }
  },
  created() {
    this.bootstrap()
  },
  methods: {
    getEmptyForm() {
      return { id: "", name: "", code: "", parentId: "", remark: "" }
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
      } catch (e) {
        this.tree = []
      } finally {
        this.treeLoading = false
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getPermissionPage({
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
        this.form = { ...this.getEmptyForm(), ...(res?.data || row) }
      } catch (e) {
        this.form = { ...this.getEmptyForm(), ...row }
      }
    },
    onDialogOpened() {
      // Ensure tree is present for parent selection.
      if (!this.tree.length) this.fetchTree()
    },
    handleSave() {
      const formRef = this.$refs.formRef
      if (!formRef) return
      formRef.validate(async valid => {
        if (!valid) return
        this.saveLoading = true
        try {
          if (this.isEdit) {
            await updatePermission({ ...this.form })
            this.$message.success("更新成功")
          } else {
            await createPermission({ ...this.form })
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
