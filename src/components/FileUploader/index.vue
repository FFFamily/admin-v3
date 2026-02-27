<template>
  <div class="file-uploader">
    <el-upload
      class="upload-demo"
      :class="{ 'button-mode': buttonMode }"
      :drag="!buttonMode"
      :action="action"
      :headers="computedHeaders"
      :file-list="internalFileList"
      :limit="limit"
      :multiple="multiple"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :on-exceed="onExceed"
      :show-file-list="showFileList"
      :accept="accept"
      :disabled="disabled"
    >
      <template v-if="buttonMode">
        <div class="button-group">
          <!-- 如果禁用且有文件，只显示查看按钮 -->
          <template v-if="disabled && hasFile">
            <el-button
              type="success"
              icon="el-icon-view"
              @click="handlePreviewFile"
            >
              查看
            </el-button>
          </template>
          <!-- 否则显示上传按钮和查看按钮（如果有文件） -->
          <template v-else>
            <el-button type="primary" icon="el-icon-upload2">
              {{ hasFile ? '重新上传' : '上传文件' }}
            </el-button>
            <el-button
              v-if="hasFile"
              type="success"
              icon="el-icon-view"
              @click="handlePreviewFile"
            >
              查看
            </el-button>
          </template>
        </div>
      </template>
      <template v-else>
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          <span v-if="templateUrl" class="template-link">
            <a :href="templateUrl" target="_blank" @click.stop="downloadTemplate">
              {{ templateText || '下载模板' }}
            </a>
            后，
          </span>
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </template>
      <template #tip>
        <div v-if="tips" class="el-upload__tip">{{ tips }}</div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'FileUploader',
  props: {
    modelValue: {
      // Vue 3 v-model
      type: [String, Array],
      default: undefined
    },
    value: {
      // 单文件：String，多文件：Array<String>
      type: [String, Array],
      default: () => ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 1
    },
    action: {
      type: String,
      default: '/api/system/file/upload'
    },
    headers: {
      type: Object,
      default: () => ({})
    },
    maxSizeMB: {
      type: Number,
      default: 10
    },
    tips: {
      type: String,
      default: ''
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    accept: {
      type: String,
      default: '.xlsx,.xls,.csv,.txt,.doc,.docx,.pdf'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    templateUrl: {
      type: String,
      default: ''
    },
    templateText: {
      type: String,
      default: '下载模板'
    },
    baseUrl: {
      type: String,
      default: () => import.meta.env.VITE_BASE_URL || ''
    },
    buttonMode: {
      // 是否使用按钮模式
      type: Boolean,
      default: false
    },
    prependBaseUrl: {
      // 是否拼接 baseUrl 前缀，默认拼接
      type: Boolean,
      default: true
    }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    internalFileList() {
      if (this.multiple) {
        const urls = Array.isArray(this.currentValue) ? this.currentValue : (this.currentValue ? [this.currentValue] : [])
        return urls.map((raw, idx) => ({ name: `文件${idx + 1}`, url: this.resolveDisplayUrl(raw), rawUrl: raw }))
      }
      if (typeof this.currentValue === 'string' && this.currentValue) {
        return [{ name: '文件', url: this.resolveDisplayUrl(this.currentValue), rawUrl: this.currentValue }]
      }
      return []
    },
    computedHeaders() {
      // 默认加上 Token-Key，允许外部 headers 覆盖
      return { 'Token-Key': getToken(), ...this.headers }
    },
    hasFile() {
      if (this.multiple) {
        return Array.isArray(this.currentValue) && this.currentValue.length > 0
      }
      // 单文件模式：检查值是否存在且不为空
      if (this.currentValue === null || this.currentValue === undefined) {
        return false
      }
      const strValue = String(this.currentValue).trim()
      return strValue !== '' && strValue !== 'null' && strValue !== 'undefined'
    }
  },
  methods: {
    emitValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('input', value)
    },
    isAbsoluteUrl(url) {
      return /^(?:[a-z]+:)?\/\//i.test(url) || /^data:/i.test(url)
    },
    resolveDisplayUrl(rawUrl) {
      if (!rawUrl) return ''
      if (this.isAbsoluteUrl(rawUrl)) return rawUrl
      // 如果不需要拼接 baseUrl，直接返回原始 URL
      if (!this.prependBaseUrl) return rawUrl
      const base = (this.baseUrl || '').replace(/\/$/, '')
      const path = String(rawUrl).startsWith('/') ? rawUrl : `/${rawUrl}`
      return `${base}${path}`
    },
    beforeUpload(file) {
      const isLt = file.size / 1024 / 1024 < this.maxSizeMB

      if (!isLt) {
        this.$message.error(`上传文件大小不能超过 ${this.maxSizeMB}MB!`)
        return false
      }

      // 触发 before-upload 事件，允许父组件进行额外验证
      this.$emit('before-upload', file)
      return true
    },
    onSuccess(response, file, fileList) {
      if (!response || (response.code !== 200 && response.code !== '200')) {
        this.$message.error('上传失败')
        this.$emit('error', response)
        return
      }
      const rawUrl = (response.data && (response.data.fileUrl || response.data.url)) || ''
      if (!rawUrl) {
        this.$message.error('上传返回数据缺少文件地址')
        return
      }
      // 根据 prependBaseUrl 决定是否拼接 baseUrl
      const emitValue = this.prependBaseUrl ? this.resolveDisplayUrl(rawUrl) : rawUrl
      if (this.multiple) {
        const current = Array.isArray(this.currentValue) ? this.currentValue.slice() : []
        current.push(emitValue)
        // 受限于 limit
        const limited = current.slice(0, this.limit)
        this.emitValue(limited)
      } else {
        this.emitValue(emitValue)
      }
      this.$emit('success', emitValue, file, fileList)
      this.$message.success('上传成功')
    },
    onError(err) {
      // 透传错误
      // eslint-disable-next-line no-console
      console.error('上传失败:', err)
      this.$message.error('上传失败')
      this.$emit('error', err)
    },
    onRemove(file, fileList) {
      if (this.multiple) {
        // 根据 prependBaseUrl 决定使用 rawUrl 还是 url
        // 如果 prependBaseUrl 为 false，value 中存储的是原始 URL，应该使用 rawUrl
        // 如果 prependBaseUrl 为 true，value 中存储的是拼接后的 URL，应该使用 url
        const urls = (fileList || []).map(item => {
          return this.prependBaseUrl ? item.url : (item.rawUrl || item.url)
        }).filter(Boolean)
        this.emitValue(urls)
      } else {
        this.emitValue('')
      }
      this.$emit('remove', file, fileList)
    },
    onExceed(files, fileList) {
      this.$message.warning(`最多只能上传 ${this.limit} 个文件`)
      this.$emit('exceed', files, fileList)
    },
    downloadTemplate() {
      this.$emit('download-template', this.templateUrl)
    },
    handlePreviewFile() {
      if (!this.hasFile) {
        this.$message.warning('没有可预览的文件')
        return
      }

      let fileUrl = ''
      if (this.multiple) {
        // 多文件模式，取第一个文件
        fileUrl = Array.isArray(this.currentValue) && this.currentValue.length > 0 ? this.currentValue[0] : ''
      } else {
        // 单文件模式
        fileUrl = this.currentValue
      }

      if (!fileUrl) {
        this.$message.warning('文件地址为空')
        return
      }

      // 构建完整的文件URL（预览时总是拼接 baseUrl 以便访问）
      let fullUrl = fileUrl
      if (!this.isAbsoluteUrl(fileUrl)) {
        const base = (this.baseUrl || '').replace(/\/$/, '')
        const path = String(fileUrl).startsWith('/') ? fileUrl : `/${fileUrl}`
        fullUrl = `${base}${path}`
      }

      // 在新窗口中打开PDF文件
      window.open(fullUrl, '_blank')

      // 触发预览事件
      this.$emit('preview', { url: fullUrl })
    }
  }
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.template-link {
  color: #409eff;
}

.template-link a {
  color: #409eff;
  text-decoration: none;
}

.template-link a:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.button-mode {
  .el-upload {
    display: inline-block;
  }

  .el-upload-dragger {
    border: none;
    background: none;
    width: auto;
    height: auto;
  }

  .button-group {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}
</style>
