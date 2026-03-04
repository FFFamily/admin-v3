<template>
  <div class="admin-announcement">
    <el-card v-permission="'announcement:list'">
      <el-form :inline="true" :model="query" class="query-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="标题/内容"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="发布" :value="1" />
            <el-option label="下线" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-permission="'announcement:create'" type="success" @click="openCreate">
            新增公告
          </el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" border style="width: 100%; margin-top: 10px">
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="内容" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            {{ summary(row.content) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? "发布" : "下线" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'announcement:update'" type="primary" link @click="openEdit(row)">
              编辑
            </el-button>
            <el-button
              v-permission="'announcement:publish'"
              type="primary"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? "下线" : "发布" }}
            </el-button>
            <el-button v-permission="'announcement:delete'" type="danger" link @click="remove(row)">
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

    <el-dialog :title="isEdit ? '编辑公告' : '新增公告'" v-model="dialogVisible" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" maxlength="5000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAnnouncementPage,
  getAnnouncementDetail,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement
} from "@/api/admin/announcement"

export default {
  name: "AdminAnnouncementPage",
  data() {
    return {
      loading: false,
      saving: false,
      list: [],
      total: 0,
      query: {
        current: 1,
        size: 10,
        keyword: "",
        status: null
      },
      dialogVisible: false,
      isEdit: false,
      form: {
        id: "",
        title: "",
        content: ""
      },
      rules: {
        title: [{ required: true, message: "请输入公告标题", trigger: "blur" }],
        content: [{ required: true, message: "请输入公告内容", trigger: "blur" }]
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    summary(content) {
      if (!content) return "--"
      const text = String(content).replace(/\s+/g, " ").trim()
      return text.length > 80 ? `${text.slice(0, 80)}...` : text
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getAnnouncementPage({
          current: this.query.current,
          size: this.query.size,
          keyword: this.query.keyword || undefined,
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
      this.query = {
        current: 1,
        size: 10,
        keyword: "",
        status: null
      }
      this.fetchList()
    },
    openCreate() {
      this.isEdit = false
      this.form = { id: "", title: "", content: "" }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef?.clearValidate())
    },
    async openEdit(row) {
      try {
        const res = await getAnnouncementDetail(row.id)
        const detail = res?.data || {}
        this.isEdit = true
        this.form = {
          id: detail.id,
          title: detail.title || "",
          content: detail.content || ""
        }
        this.dialogVisible = true
        this.$nextTick(() => this.$refs.formRef?.clearValidate())
      } catch (e) {
        this.$message.error("获取公告详情失败")
      }
    },
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.isEdit) {
            await updateAnnouncement(this.form.id, {
              title: this.form.title,
              content: this.form.content
            })
            this.$message.success("更新成功")
          } else {
            await createAnnouncement({
              title: this.form.title,
              content: this.form.content
            })
            this.$message.success("创建成功")
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (e) {
          this.$message.error(this.isEdit ? "更新失败" : "创建失败")
        } finally {
          this.saving = false
        }
      })
    },
    async toggleStatus(row) {
      const nextStatus = row.status === 1 ? 0 : 1
      const actionText = nextStatus === 1 ? "发布" : "下线"
      try {
        await this.$confirm(`确认${actionText}该公告吗？`, "提示", {
          type: "warning"
        })
        await updateAnnouncementStatus(row.id, nextStatus)
        this.$message.success(`${actionText}成功`)
        this.fetchList()
      } catch (e) {
        if (e !== "cancel") {
          this.$message.error(`${actionText}失败`)
        }
      }
    },
    async remove(row) {
      try {
        await this.$confirm("确认删除该公告吗？", "提示", {
          type: "warning"
        })
        await deleteAnnouncement(row.id)
        this.$message.success("删除成功")
        this.fetchList()
      } catch (e) {
        if (e !== "cancel") {
          this.$message.error("删除失败")
        }
      }
    }
  }
}
</script>

<style scoped>
.admin-announcement {
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
