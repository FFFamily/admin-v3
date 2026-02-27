<template>
  <el-card>
    <el-row :gutter="15">
      <el-col v-for="(data, index) in form.homeImg" :key="data.url" :span="6" :offset="0">
        <el-card
          :body-style="{ padding: '0px' }"
          :class="{ 'moving-up': movingIndex === index && moveDirection === 'up', 'moving-down': movingIndex === index && moveDirection === 'down' }"
          class="image-card"
        >
          <img :src="data.url" class="image">
          <div class="input-container">
            <span class="input-title">
              <i class="el-icon-link" />
              用户点击跳转链接
            </span>
            <el-input
              v-model="data.path"
              placeholder="请输入跳转链接，例如：https://example.com"
              size="small"
              class="custom-input"
              :class="{ 'is-valid': isValidUrl(data.path), 'is-invalid': data.path && !isValidUrl(data.path) }"
              prefix-icon="el-icon-link"
              @blur="validateUrl(data.path)"
            />
            <div v-if="data.path && !isValidUrl(data.path)" class="input-error">
              <i class="el-icon-warning" />
              请输入有效的URL地址
            </div>
          </div>
          <div style="padding: 14px;">
            <div class="bottom clearfix">
              <el-button size="mini" type="primary" :disabled="index === 0" @click="moveUp(index)">上移</el-button>
              <el-button
                size="mini"
                type="primary"
                :disabled="index === form.homeImg.length - 1"
                @click="moveDown(index)"
              >下移</el-button>
              <el-button size="mini" type="danger" @click="removeImage(index)">删除</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="upload-area">
      <el-upload
        class="upload-demo"
        action="/api/system/file/upload"
        list-type="picture-card"
        :show-file-list="false"
        :on-success="handleUploadSuccess"
        :before-upload="beforeUpload"
        :headers="{ 'Token-Key': getToken() }"
        multiple
      >
        <i class="el-icon-plus" />
      </el-upload>
    </div>
    <el-button type="primary" @click="handleSave">保存</el-button>
  </el-card>
</template>

<script>
import { getWxHomeConfig, updateHomeConfig } from '@/api/homeConfig'
import { getToken } from '@/utils/auth'
import { getCategoryList } from '@/api/categories'
export default {
  name: 'SystemConfig',
  data() {
    return {
      form: {
        homeImg: [], // 图片url数组
        mallType: [] // 商城分类类型，存储分类ID数组
      },
      fileList: [],
      getToken: getToken,
      categories: [], // 商品分类列表
      movingIndex: -1, // 当前移动的图片索引
      moveDirection: '' // 移动方向：'up' 或 'down'
    }
  },
  created() {
    this.getWxHomeConfig()
    this.getCategoryList()
  },
  methods: {
    getWxHomeConfig() {
      getWxHomeConfig().then(res => {
        this.form = res.data
        // 将字符串转换为数组（如果是字符串格式）
        if (typeof this.form.mallType === 'string') {
          this.form.mallType = this.form.mallType.split(',').filter(id => id)
        }
        // 将homeImg字符串转换为数组
        this.form.homeImg = JSON.parse(this.form.homeImg)
      })
    },
    getCategoryList() {
      getCategoryList().then(res => {
        this.categories = res.data
      })
    },
    getCategoryName(ids) {
      if (!Array.isArray(ids)) return ''
      return ids.map(id => {
        const category = this.categories.find(cat => cat.id === id)
        return category ? category.name : '未知分类'
      }).join('、')
    },
    handleUploadSuccess(res, file) {
      const imageUrl = import.meta.env.VITE_BASE_URL + res.data.fileUrl
      this.form.homeImg.push({
        url: imageUrl,
        path: ''
      })
      console.log(this.form.homeImg)
      this.$message.success('图片上传成功')
    },
    removeImage(index) {
      this.$confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.form.homeImg.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消删除
      })
    },
    moveUp(index) {
      if (index > 0) {
        this.moveDirection = 'up'
        this.movingIndex = index

        // 添加动画延迟，让用户看到动画效果
        setTimeout(() => {
          const temp = this.form.homeImg[index]
          this.form.homeImg[index] = this.form.homeImg[index - 1]
          this.form.homeImg[index - 1] = temp

          // 动画结束后清除状态
          setTimeout(() => {
            this.movingIndex = -1
            this.moveDirection = ''
          }, 300)
        }, 100)
      }
    },
    moveDown(index) {
      if (index < this.form.homeImg.length - 1) {
        this.moveDirection = 'down'
        this.movingIndex = index

        // 添加动画延迟，让用户看到动画效果
        setTimeout(() => {
          const temp = this.form.homeImg[index]
          this.form.homeImg[index] = this.form.homeImg[index + 1]
          this.form.homeImg[index + 1] = temp

          // 动画结束后清除状态
          setTimeout(() => {
            this.movingIndex = -1
            this.moveDirection = ''
          }, 300)
        }, 100)
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件！')
      }
      return isImage
    },
    handleSave() {
      const config = {
        ...this.form,
        // 拼接成字符串
        homeImg: JSON.stringify(this.form.homeImg),
        mallType: this.form.mallType.join(',') // 将数组转换为逗号分隔的字符串
      }
      updateHomeConfig(config.id, config).then(res => {
        this.$message.success('保存成功')
      })
    },
    isValidUrl(string) {
      if (!string) return true
      try {
        const url = new URL(string)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch (_) {
        return false
      }
    },
    validateUrl(url) {
      if (url && !this.isValidUrl(url)) {
        this.$message.warning('请输入有效的URL地址')
      }
    }
  }
}
</script>

<style scoped>
.input-container {
  padding: 12px 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.input-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.input-container:hover::before {
  left: 100%;
}

.input-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #495057;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.input-title i {
  margin-right: 6px;
  color: #007bff;
  font-size: 14px;
}

.custom-input {
  transition: all 0.3s ease;
}

.custom-input .el-input__inner {
  border-radius: 6px;
  border: 2px solid #e9ecef;
  background: #ffffff;
  font-size: 12px;
  padding: 8px 12px 8px 35px;
  transition: all 0.3s ease;
}

.custom-input .el-input__inner:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  background: #ffffff;
}

.custom-input .el-input__inner:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.custom-input .el-input__prefix {
  left: 10px;
  color: #6c757d;
  font-size: 14px;
}

/* 验证状态样式 */
.custom-input.is-valid .el-input__inner {
  border-color: #28a745;
  background: #f8fff9;
}

.custom-input.is-valid .el-input__prefix {
  color: #28a745;
}

.custom-input.is-invalid .el-input__inner {
  border-color: #dc3545;
  background: #fff8f8;
}

.custom-input.is-invalid .el-input__prefix {
  color: #dc3545;
}

.input-error {
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 11px;
  color: #dc3545;
  padding: 4px 8px;
  background: #fff5f5;
  border-radius: 4px;
  border-left: 3px solid #dc3545;
}

.input-error i {
  margin-right: 4px;
  font-size: 12px;
}

.image-manager {
  width: 100%;
}

.image-col {
  margin-bottom: 15px;
}

/* 图片卡片基础样式 */
.image-card {
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  height: auto;
  margin-bottom: 15px;
}

/* 确保卡片内容区域固定高度 */
.image-card .el-card__body {
  padding: 0 !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 响应式设计，确保在不同屏幕尺寸下保持比例 */
@media (max-width: 768px) {
  .image {
    height: 150px;
  }
}

@media (min-width: 1200px) {
  .image {
    height: 220px;
  }
}

/* 上移动画 */
.moving-up {
  animation: moveUpAnimation 0.4s ease-in-out;
  transform: translateY(-10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* 下移动画 */
.moving-down {
  animation: moveDownAnimation 0.4s ease-in-out;
  transform: translateY(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* 上移动画关键帧 */
@keyframes moveUpAnimation {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* 下移动画关键帧 */
@keyframes moveDownAnimation {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(20px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(10px);
    opacity: 1;
  }
}

.image-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 5px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.image-index {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.upload-area {
  margin-top: 10px;
  margin-bottom: 10px;
}

.upload-demo {
  display: inline-block;
}

.upload-text {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.el-upload__tip {
  margin-top: 10px;
  color: #999;
  font-size: 12px;
}

.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 10px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  height: 200px; /* 固定高度，配合宽度形成4:3比例 */
  display: block;
  object-fit: cover; /* 保持图片比例，裁剪多余部分 */
  object-position: center; /* 居中裁剪 */
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}
</style>
