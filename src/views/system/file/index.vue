<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="文件原名">
        <el-input v-model="queryParams.originalName" placeholder="请输入文件原名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="上传用户">
        <el-input v-model="queryParams.uploadUserName" placeholder="请输入上传用户名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="文件状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" :value="1" />
          <el-option label="删除" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-upload
          :action="uploadAction"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
        >
          <el-button type="primary" icon="el-icon-upload2">上传文件</el-button>
        </el-upload>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="fileList" border>
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column prop="originalName" label="文件原名" min-width="200" show-overflow-tooltip />
      <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
      <el-table-column prop="fileSize" label="文件大小" width="120" align="center">
        <template #default="scope">
          {{ formatFileSize(scope.row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="fileType" label="文件类型" width="120" align="center" />
      <el-table-column prop="fileExt" label="扩展名" width="100" align="center" />
      <el-table-column prop="fileMd5" label="MD5值" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span style="font-family: monospace; font-size: 12px;">{{ scope.row.fileMd5 || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uploadUserName" label="上传用户" width="150" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.status === 1 ? '正常' : '删除' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fileUrl" label="文件URL" min-width="280" show-overflow-tooltip>
        <template #default="scope">
          <el-link
            v-if="scope.row.fileUrl"
            :href="getFileUrl(scope.row.fileUrl)"
            target="_blank"
            type="primary"
            :underline="false"
          >
            <i class="el-icon-link" /> 查看文件
          </el-link>
          <el-button
            v-if="scope.row.fileUrl"
            type="text"
            size="mini"
            style="margin-left: 8px;"
            @click.stop="handleCopyUrl(scope.row.fileUrl)"
          >
            拷贝地址
          </el-button>
          <span v-else style="color: #909399;">--</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span style="color: #909399;">{{ scope.row.remark || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" show-overflow-tooltip>
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.page"
      :page-sizes="[10, 20, 50, 100]"
      v-model:page-size="queryParams.size"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { getFileListPage } from '@/api/file'
import { parseTime } from '@/utils'
import { getToken } from '@/utils/auth'

const BASE_API = (import.meta.env.VITE_BASE_API || '/api').replace(/\/+$/, '')
const ASSET_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_API || '').replace(/\/+$/, '')

export default {
  name: 'FileManagement',
  data() {
    return {
      loading: false,
      fileList: [],
      total: 0,
      queryParams: {
        page: 1,
        size: 10,
        originalName: '',
        uploadUserName: '',
        status: null
      },
      uploadAction: BASE_API + '/system/file/upload'
    }
  },
  computed: {
    uploadHeaders() {
      return {
        'Token-Key': getToken()
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const response = await getFileListPage(this.queryParams)
        this.fileList = response.data.records || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取文件列表失败:', error)
        this.$message.error('获取文件列表失败')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.page = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        size: 10,
        originalName: '',
        uploadUserName: '',
        status: null
      }
      this.fetchList()
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.fetchList()
    },
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    // 拷贝文件访问地址
    handleCopyUrl(fileUrl) {
      const fullUrl = this.getFileUrl(fileUrl)
      if (!fullUrl) {
        this.$message.warning('暂无可复制的地址')
        return
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullUrl).then(() => {
          this.$message.success('已拷贝文件地址')
        }).catch(() => {
          this.$message.error('拷贝失败，请稍后重试')
        })
      } else {
        const input = document.createElement('input')
        input.value = fullUrl
        document.body.appendChild(input)
        input.select()
        try {
          document.execCommand('copy')
          this.$message.success('已拷贝文件地址')
        } catch (e) {
          this.$message.error('拷贝失败，请手动复制')
        }
        document.body.removeChild(input)
      }
    },
    // 拼接后端文件访问地址
    getFileUrl(fileUrl) {
      if (!fileUrl) return ''
      // 已经是完整 URL（http/https 或 data:），直接返回
      if (/^(?:[a-z]+:)?\/\//i.test(fileUrl) || /^data:/i.test(fileUrl)) {
        return fileUrl
      }
      const path = String(fileUrl).startsWith('/') ? fileUrl : `/${fileUrl}`
      return `${ASSET_BASE_URL}${path}`
    },
    beforeUpload(file) {
      const isLt = file.size / 1024 / 1024 < 100 // 限制100MB
      if (!isLt) {
        this.$message.error('上传文件大小不能超过 100MB!')
        return false
      }
      return true
    },
    handleUploadSuccess(response, file) {
      if (response && response.code === 200) {
        this.$message.success('上传成功')
        this.fetchList() // 刷新列表
      } else {
        this.$message.error(response.msg || '上传失败')
      }
    },
    handleUploadError(err) {
      console.error('上传失败:', err)
      this.$message.error('上传失败，请重试')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 20px;
}

.mb8 {
  margin-bottom: 8px;
}
</style>
