<template>
  <div class="admin-department-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="部门列表" name="list">
          <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
            <el-form-item label="关键字">
              <el-input
                v-model="query.keyword"
                placeholder="部门名称"
                clearable
                style="width: 240px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button v-permission="'department:create'" type="success" style="margin-left: 10px" @click="handleAdd">新增部门</el-button>
              <el-button
                v-permission="'department:delete'"
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
            <el-table-column prop="parentId" label="父级" width="120" />
            <el-table-column prop="status" label="状态" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.status" :type="row.status === 'use' ? 'success' : 'danger'">
                  {{ row.status === "use" ? "启用" : "禁用" }}
                </el-tag>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="160">
              <template #default="{ row }">
                <el-button v-permission="'department:update'" link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button v-permission="'department:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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

        <el-tab-pane label="部门树" name="tree">
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
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增/编辑 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="620px" @opened="onDialogOpened">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
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
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" clearable placeholder="可选" style="width: 100%">
            <el-option label="启用" value="use" />
            <el-option label="禁用" value="disable" />
          </el-select>
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
  batchDeleteDepartments,
  createDepartment,
  deleteDepartment,
  getDepartmentPage,
  getDepartmentTree,
  updateDepartment
} from "@/api/admin/department"

export default {
  name: "AdminDepartmentPage",
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
        name: [{ required: true, message: "请输入部门名称", trigger: "blur" }]
      }
    }
  },
  created() {
    this.bootstrap()
  },
  methods: {
    getEmptyForm() {
      return { id: "", name: "", parentId: "", status: "use", remark: "" }
    },
    async bootstrap() {
      await this.fetchTree()
      this.fetchList()
    },
    async fetchTree() {
      this.treeLoading = true
      try {
        const res = await getDepartmentTree()
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
        const res = await getDepartmentPage({
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
      this.dialogTitle = "新增部门"
      this.form = this.getEmptyForm()
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = "编辑部门"
      this.form = { ...this.getEmptyForm(), ...row }
      this.dialogVisible = true
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
          if (this.isEdit) {
            await updateDepartment({ ...this.form })
            this.$message.success("更新成功")
          } else {
            await createDepartment({ ...this.form })
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
      this.$confirm("确认删除该部门吗？", "提示", { type: "warning" })
        .then(async () => {
          await deleteDepartment(row.id)
          this.$message.success("删除成功")
          await this.fetchTree()
          this.fetchList()
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      if (!this.selectedIds.length) return
      this.$confirm(`确认删除选中的 ${this.selectedIds.length} 个部门吗？`, "提示", { type: "warning" })
        .then(async () => {
          await batchDeleteDepartments(this.selectedIds)
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
.admin-department-page {
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
