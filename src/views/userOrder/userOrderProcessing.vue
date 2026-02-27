<template>
  <div class="app-container">
    <div class="page-header">
      <h2>登记加工信息</h2>
    </div>

    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="订单编号">
        <el-input v-model="orderInfo.no" readonly disabled />
      </el-form-item>

      <!-- 这里添加加工相关的表单字段 -->
      <el-form-item label="加工日期" prop="processingDate">
        <el-date-picker
          v-model="form.processingDate"
          type="date"
          placeholder="请选择加工日期"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="加工类型" prop="processingType">
        <el-select v-model="form.processingType" placeholder="请选择加工类型" style="width: 100%;">
          <el-option label="初加工" value="primary" />
          <el-option label="深加工" value="deep" />
          <el-option label="精加工" value="fine" />
        </el-select>
      </el-form-item>

      <el-form-item label="加工工厂" prop="processingFactory">
        <el-input v-model="form.processingFactory" placeholder="请输入加工工厂" />
      </el-form-item>

      <el-form-item label="加工数量" prop="processingQuantity">
        <el-input-number
          v-model="form.processingQuantity"
          :precision="2"
          :step="1"
          :min="0"
          placeholder="请输入加工数量"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="加工费用" prop="processingCost">
        <el-input-number
          v-model="form.processingCost"
          :precision="2"
          :step="0.01"
          :min="0"
          placeholder="请输入加工费用"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="加工备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入加工备注"
        />
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserOrderProcessing',
  data() {
    return {
      submitLoading: false,
      orderInfo: {},
      form: {
        processingDate: '',
        processingType: '',
        processingFactory: '',
        processingQuantity: 0,
        processingCost: 0,
        remark: ''
      },
      rules: {
        processingDate: [
          { required: true, message: '请选择加工日期', trigger: 'change' }
        ],
        processingType: [
          { required: true, message: '请选择加工类型', trigger: 'change' }
        ],
        processingFactory: [
          { required: true, message: '请输入加工工厂', trigger: 'blur' }
        ],
        processingQuantity: [
          { required: true, message: '请输入加工数量', trigger: 'blur' }
        ],
        processingCost: [
          { required: true, message: '请输入加工费用', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    async initData() {
      const id = this.$route.query.id
      if (!id) {
        this.$message.error('订单ID不存在')
        this.$router.push({ name: 'UserOrderList' })
        return
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }
        this.submitLoading = true
        try {
          // TODO: 调用保存加工信息的API
          this.$message.success('保存成功')
          this.$router.push({ name: 'UserOrderList' })
        } catch (error) {
          console.error('保存失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.submitLoading = false
        }
      })
    },
    handleCancel() {
      this.$router.push({ name: 'UserOrderList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .page-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
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
}
</style>

