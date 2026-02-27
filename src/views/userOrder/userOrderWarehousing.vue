<template>
  <div class="app-container">
    <div class="page-header">
      <h2>登记入库信息</h2>
    </div>

    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="订单编号">
        <el-input v-model="orderInfo.no" readonly disabled />
      </el-form-item>

      <!-- 这里添加入库相关的表单字段 -->
      <el-form-item label="入库日期" prop="warehousingDate">
        <el-date-picker
          v-model="form.warehousingDate"
          type="date"
          placeholder="请选择入库日期"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="仓库" prop="warehouseId">
        <el-input
          v-model="form.warehouseName"
          placeholder="请选择仓库"
          readonly
          @focus="showWarehouseSelector"
        >
          <template #append>
            <el-button type="primary" @click="showWarehouseSelector">选择仓库</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="入库数量" prop="warehousingQuantity">
        <el-input-number
          v-model="form.warehousingQuantity"
          :precision="2"
          :step="1"
          :min="0"
          placeholder="请输入入库数量"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="入库单号" prop="warehousingNo">
        <el-input v-model="form.warehousingNo" placeholder="请输入入库单号" />
      </el-form-item>

      <el-form-item label="入库备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入入库备注"
        />
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>

    <!-- 仓库选择器 -->
    <warehouse-selector
      v-model:visible="warehouseSelectorVisible"
      title="选择仓库"
      :multiple="false"
      @confirm="handleWarehouseSelected"
    />
  </div>
</template>

<script>
import WarehouseSelector from '@/components/WarehouseSelector'

export default {
  name: 'UserOrderWarehousing',
  components: {
    WarehouseSelector
  },
  data() {
    return {
      submitLoading: false,
      warehouseSelectorVisible: false,
      orderInfo: {},
      form: {
        warehousingDate: '',
        warehouseId: '',
        warehouseName: '',
        warehousingQuantity: 0,
        warehousingNo: '',
        remark: ''
      },
      rules: {
        warehousingDate: [
          { required: true, message: '请选择入库日期', trigger: 'change' }
        ],
        warehouseId: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        warehousingQuantity: [
          { required: true, message: '请输入入库数量', trigger: 'blur' }
        ],
        warehousingNo: [
          { required: true, message: '请输入入库单号', trigger: 'blur' }
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
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },
    handleWarehouseSelected(warehouses) {
      if (warehouses && warehouses.length > 0) {
        this.form.warehouseId = warehouses[0].id
        this.form.warehouseName = warehouses[0].warehouseName
        this.$refs.form.validateField('warehouseId')
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }
        this.submitLoading = true
        try {
          // TODO: 调用保存入库信息的API
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
