<template>
  <div class="image-uploader">
    <el-upload
      class="upload-demo"
      :action="action"
      :headers="computedHeaders"
      :file-list="internalFileList"
      :list-type="listType"
      :limit="limit"
      :multiple="multiple"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :on-preview="onPreview"
      :show-file-list="showFileList"
      accept="image/*"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <div v-if="tips" class="uploader-tips">{{ tips }}</div>
  </div>

</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'ImageUploader',
  props: {
    modelValue: {
      // Vue 3 v-model
      type: [String, Array],
      default: undefined
    },
    value: {
      // 单图：String，多图：Array<String>
      type: [String, Array],
      default: () => []
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 5
    },
    action: {
      type: String,
      default: '/api/system/file/upload'
    },
    headers: {
      type: Object,
      default: () => ({})
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    maxSizeMB: {
      type: Number,
      default: 2
    },
    tips: {
      type: String,
      default: ''
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    baseUrl: {
      type: String,
      // Use absolute backend base when available (for image preview/display URLs).
      default: () => import.meta.env.VITE_API_BASE_URL || ''
    },
    emitRaw: {
      // 是否向外部输出后端返回的原始 fileUrl（相对/接口地址）。
      // 若为 false，则向外部输出拼接后的完整可访问 URL。
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentValue() {
      // Prefer Vue 3 v-model, fall back to legacy `value`.
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    internalFileList() {
      if (this.multiple) {
        const urls = Array.isArray(this.currentValue) ? this.currentValue : (this.currentValue ? [this.currentValue] : [])
        return urls.map((raw, idx) => ({ name: `图片${idx + 1}`, url: this.resolveDisplayUrl(raw), rawUrl: raw }))
      }
      if (typeof this.currentValue === 'string' && this.currentValue) {
        return [{ name: '图片', url: this.resolveDisplayUrl(this.currentValue), rawUrl: this.currentValue }]
      }
      return []
    },
    computedHeaders() {
      // 默认加上 Token-Key，允许外部 headers 覆盖
      return { 'Token-Key': getToken(), ...this.headers }
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
      const base = (this.baseUrl || '').replace(/\/$/, '')
      const path = String(rawUrl).startsWith('/') ? rawUrl : `/${rawUrl}`
      return `${base}${path}`
    },
    toRawUrlFromDisplay(displayUrl) {
      if (!displayUrl) return ''
      if (!this.baseUrl) return displayUrl
      const base = (this.baseUrl || '').replace(/\/$/, '')
      if (displayUrl.startsWith(base)) {
        const maybe = displayUrl.slice(base.length)
        return maybe.startsWith('/') ? maybe : `/${maybe}`
      }
      return displayUrl
    },
    beforeUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      const isLt = file.size / 1024 / 1024 < this.maxSizeMB

      if (!isImage) {
        this.$message.error('上传图片只能是 JPG、PNG 或 GIF 格式!')
      }
      if (!isLt) {
        this.$message.error(`上传图片大小不能超过 ${this.maxSizeMB}MB!`)
      }
      return isImage && isLt
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
      const emitValue = this.emitRaw ? rawUrl : this.resolveDisplayUrl(rawUrl)
      if (this.multiple) {
        const current = Array.isArray(this.currentValue) ? this.currentValue.slice() : []
        current.push(emitValue)
        // 受限于 limit
        const limited = current.slice(0, this.limit)
        this.emitValue(limited)
      } else {
        this.emitValue(emitValue)
      }
      console.log('emitValue', emitValue)
      this.$emit('success', emitValue)
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
        const urls = (fileList || []).map(item => {
          // 优先使用我们放进去的 rawUrl，其次用 response，再次从显示 URL 反推原始路径
          return item.rawUrl || (item.response && item.response.data && (item.response.data.fileUrl || item.response.data.url)) || this.toRawUrlFromDisplay(item.url)
        })
        const mapped = (this.emitRaw ? urls : urls.map(u => this.resolveDisplayUrl(u))).filter(Boolean)
        this.emitValue(mapped)
      } else {
        this.emitValue(this.emitRaw ? '' : '')
      }
      this.$emit('remove', file, fileList)
    },
    onPreview(file) {
      const display = file && (file.url || (file.response && (file.response.data && (file.response.data.fileUrl || file.response.data.url))))
      const url = this.resolveDisplayUrl(display)
      if (url) {
        this.$emit('preview', { url })
      }
    }
  }
}
</script>

<style scoped>
.uploader-tips {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
