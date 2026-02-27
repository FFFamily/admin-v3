<template>
  <div class="app-container">
    <div class="page-header">
      <h2>登记运输信息</h2>
    </div>

    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="订单编号">
        <el-input v-model="orderInfo.no" readonly disabled />
      </el-form-item>

      <!-- 这里添加运输相关的表单字段 -->
      <el-form-item label="运输日期" prop="transportDate">
        <el-date-picker
          v-model="form.transportDate"
          type="date"
          placeholder="请选择运输日期"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="运输方式" prop="transportMethod">
        <el-select v-model="form.transportMethod" placeholder="请选择运输方式" style="width: 100%;">
          <el-option label="公路运输" value="highway" />
          <el-option label="铁路运输" value="railway" />
          <el-option label="水路运输" value="waterway" />
          <el-option label="航空运输" value="airway" />
        </el-select>
      </el-form-item>

      <el-form-item label="运输公司" prop="transportCompany">
        <el-input v-model="form.transportCompany" placeholder="请输入运输公司" />
      </el-form-item>

      <el-form-item label="运输单号" prop="transportNo">
        <el-input v-model="form.transportNo" placeholder="请输入运输单号" />
      </el-form-item>

      <el-form-item label="运输费用" prop="transportCost">
        <el-input-number
          v-model="form.transportCost"
          :precision="2"
          :step="0.01"
          :min="0"
          placeholder="请输入运输费用"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="运输备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入运输备注"
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
  name: 'UserOrderTransport',
  data() {
    return {
      submitLoading: false,
      orderInfo: {},
      form: {
        transportDate: '',
        transportMethod: '',
        transportCompany: '',
        transportNo: '',
        transportCost: 0,
        remark: ''
      },
      rules: {
        transportDate: [
          { required: true, message: '请选择运输日期', trigger: 'change' }
        ],
        transportMethod: [
          { required: true, message: '请选择运输方式', trigger: 'change' }
        ],
        transportCompany: [
          { required: true, message: '请输入运输公司', trigger: 'blur' }
        ],
        transportNo: [
          { required: true, message: '请输入运输单号', trigger: 'blur' }
        ],
        transportCost: [
          { required: true, message: '请输入运输费用', trigger: 'blur' }
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
          // TODO: 调用保存运输信息的API
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

