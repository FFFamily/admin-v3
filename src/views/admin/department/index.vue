<template>
  <div class="admin-department-page">
    <div class="header">
      <div class="title">部门管理</div>
      <div class="actions">
        <el-input
          v-model="treeKeyword"
          placeholder="搜索：名称 / 编码"
          clearable
          style="width: 240px"
          @input="applyTreeFilter"
          @clear="applyTreeFilter"
        />
        <el-button :loading="treeLoading" @click="fetchTree">刷新</el-button>
        <el-button v-permission="'department:create'" type="success" style="margin-left: 10px" @click="handleAddRoot">
          新增部门
        </el-button>
        <el-button
          v-permission="'department:create'"
          :disabled="!currentNode"
          style="margin-left: 10px"
          @click="handleAddChild(currentNode)"
        >
          新增子部门
        </el-button>
        <el-button
          v-permission="'department:update'"
          type="primary"
          :disabled="!currentNode"
          style="margin-left: 10px"
          @click="handleEdit(currentNode)"
        >
          编辑
        </el-button>
        <el-button
          v-permission="'department:delete'"
          type="danger"
          :disabled="!currentNode"
          style="margin-left: 10px"
          @click="handleDelete(currentNode)"
        >
          删除
        </el-button>
      </div>
    </div>

    <el-tree
      ref="treeRef"
      v-loading="treeLoading"
      :data="tree"
      node-key="id"
      :props="treeProps"
      default-expand-all
      highlight-current
      :filter-node-method="filterTreeNode"
      @node-click="onNodeClick"
      class="dept-tree"
    >
      <template #default="{ data }">
        <div class="tree-node">
          <div class="node-main">
            <span class="node-name">{{ data.name }}</span>
            <span v-if="data.code" class="node-code">({{ data.code }})</span>
            <el-tag
              v-if="data.status !== undefined && data.status !== null"
              size="small"
              :type="Number(data.status) === 1 ? 'success' : 'info'"
              class="node-status"
            >
              {{ Number(data.status) === 1 ? "启用" : "禁用" }}
            </el-tag>
          </div>
          <div class="node-actions">
            <el-button v-permission="'department:create'" link type="success" @click.stop="handleAddChild(data)">
              新增
            </el-button>
            <el-button v-permission="'department:update'" link type="primary" @click.stop="handleEdit(data)">
              编辑
            </el-button>
            <el-button
              v-permission="'department:delete'"
              link
              type="danger"
              :disabled="data.children && data.children.length"
              @click.stop="handleDelete(data)"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- 新增/编辑 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="620px" @opened="onDialogOpened">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入部门编码（唯一）" />
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
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
  createDepartment,
  deleteDepartment,
  getDepartmentTree,
  updateDepartment
} from "@/api/admin/department"

export default {
  name: "AdminDepartmentPage",
  data() {
    return {
      saveLoading: false,
      treeLoading: false,

      treeKeyword: "",
      tree: [],
      treeProps: { label: "name", children: "children" },
      treeSelectProps: { value: "id", label: "name", children: "children" },
      currentNode: null,

      dialogVisible: false,
      dialogTitle: "",
      isEdit: false,
      form: this.getEmptyForm(),
      rules: {
        name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
        code: [{ required: true, message: "请输入部门编码", trigger: "blur" }]
      }
    }
  },
  created() {
    this.fetchTree()
  },
  methods: {
    getEmptyForm() {
      return { id: "", name: "", code: "", parentId: "", status: 1, remark: "" }
    },
    async fetchTree() {
      this.treeLoading = true
      try {
        const res = await getDepartmentTree()
        this.tree = res?.data || []
        // keep current selection stable if possible
        if (this.currentNode?.id) {
          const id = String(this.currentNode.id)
          const next = this.findNodeById(id, this.tree)
          this.currentNode = next || null
        }
        this.$nextTick(() => this.applyTreeFilter())
      } catch (e) {
        this.tree = []
        this.currentNode = null
      } finally {
        this.treeLoading = false
      }
    },
    onNodeClick(data) {
      this.currentNode = data || null
    },
    filterTreeNode(value, data) {
      const v = String(value || "").trim().toLowerCase()
      if (!v) return true
      const name = String(data?.name || "").toLowerCase()
      const code = String(data?.code || "").toLowerCase()
      return name.includes(v) || code.includes(v)
    },
    applyTreeFilter() {
      const tree = this.$refs.treeRef
      if (tree && tree.filter) tree.filter(this.treeKeyword)
    },
    findNodeById(id, nodes) {
      const target = String(id || "")
      if (!target) return null
      const list = Array.isArray(nodes) ? nodes : []
      for (const n of list) {
        if (!n) continue
        if (String(n.id) === target) return n
        const children = n.children
        if (Array.isArray(children) && children.length) {
          const hit = this.findNodeById(target, children)
          if (hit) return hit
        }
      }
      return null
    },
    handleAddRoot() {
      this.isEdit = false
      this.dialogTitle = "新增部门"
      this.form = this.getEmptyForm()
      this.dialogVisible = true
    },
    handleAddChild(parent) {
      const p = parent || this.currentNode
      if (!p?.id) {
        this.handleAddRoot()
        return
      }
      this.isEdit = false
      this.dialogTitle = "新增子部门"
      this.form = { ...this.getEmptyForm(), parentId: p.id }
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
          const payload = { ...this.form }
          // Backend/tree convention: root parentId = "0". TreeSelect cleared value might be "".
          if (!payload.parentId) payload.parentId = "0"
          if (payload.status === undefined || payload.status === null || payload.status === "") payload.status = 1
          if (this.isEdit) {
            await updateDepartment(payload)
            this.$message.success("更新成功")
          } else {
            await createDepartment(payload)
            this.$message.success("创建成功")
          }
          this.dialogVisible = false
          await this.fetchTree()
        } finally {
          this.saveLoading = false
        }
      })
    },
    handleDelete(row) {
      if (row?.children && row.children.length) {
        this.$message.warning("该部门存在子部门，无法删除")
        return
      }
      this.$confirm("确认删除该部门吗？", "提示", { type: "warning" })
        .then(async () => {
          await deleteDepartment(row.id)
          this.$message.success("删除成功")
          await this.fetchTree()
          if (this.currentNode?.id && String(this.currentNode.id) === String(row.id)) {
            this.currentNode = null
          }
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
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.dept-tree {
  width: 100%;
}
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-right: 6px;
}
.node-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.node-name {
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-code {
  color: #666;
  font-size: 12px;
}
.node-status {
  margin-left: 4px;
}
.node-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
