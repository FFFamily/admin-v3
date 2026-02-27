<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>积分规则</span>
        </div>
      </template>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-form-item label="积分比例" prop="pointRatio">
          <el-input-number
            v-model="form.pointRatio"
            :precision="2"
            :min="0"
            :max="100"
            :step="0.01"
            placeholder="请输入积分比例"
            style="width: 300px;"
            controls-position="right"
          />
          <span style="margin-left: 10px; color: #909399;">%（0-100之间的数值）</span>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getGlobalConfig, updateGlobalConfig } from '@/api/points'

export default {
  name: 'PointsRule',
  data() {
    return {
      loading: false,
      submitLoading: false,
      form: {
        pointRatio: null
      },
      rules: {
        pointRatio: [
          { required: true, message: '请输入积分比例', trigger: 'blur' },
          { type: 'number', min: 0, max: 100, message: '积分比例必须在0-100之间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取积分配置数据
    async fetchData() {
      this.loading = true
      try {
        const response = await getGlobalConfig()
        if (response && response.data) {
          this.form.pointRatio = response.data.pointRatio || null
        }
      } catch (error) {
        console.error('获取积分配置失败:', error)
        this.$message.error('获取配置失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.submitLoading = true
        try {
          const submitData = {
            pointRatio: this.form.pointRatio
          }
          await updateGlobalConfig(submitData)
          this.$message.success('保存成功')
        } catch (error) {
          console.error('保存失败:', error)
          this.$message.error('保存失败，请稍后重试')
        } finally {
          this.submitLoading = false
        }
      })
    },
    // 重置表单
    handleReset() {
      this.$refs.form.resetFields()
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.form-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}
</style>
