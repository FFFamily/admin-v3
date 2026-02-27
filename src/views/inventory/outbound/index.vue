<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="出库类型">
        <el-select v-model="searchForm.outType" placeholder="请选择出库类型" clearable style="width: 150px;">
          <el-option
            v-for="item in outboundTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
          <el-option
            v-for="item in orderStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库">
        <el-input
          v-model="searchForm.warehouseName"
          placeholder="请选择仓库"
          readonly
          style="width: 200px;"
          @focus="showWarehouseSelector"
        >
          <template #suffix>
            <i class="el-icon-search el-input__icon" style="cursor: pointer;" @click="showWarehouseSelector" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 300px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">创建出库单</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="outNo" label="出库单号" width="180" />
      <el-table-column prop="warehouseName" label="仓库" width="150" />
      <el-table-column prop="outType" label="出库类型" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getOutboundTypeTag(scope.row.outType)" size="small">
            {{ getOutboundTypeText(scope.row.outType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getOrderStatusTag(scope.row.status)" size="small">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetOrderNo" label="目标单号" width="180" show-overflow-tooltip />
      <el-table-column prop="totalQuantity" label="总数量" width="100" align="center" />
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="confirmTime" label="确认时间" width="180" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button
            v-if="scope.row.status === 'pending'"
            size="mini"
            type="success"
            @click="handleConfirm(scope.row)"
          >
            确认出库
          </el-button>
          <el-button
            v-if="scope.row.status === 'pending'"
            size="mini"
            type="danger"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 仓库选择器 -->
    <WarehouseSelector
      v-model:visible="warehouseSelectorVisible"
      title="选择仓库"
      :multiple="false"
      :active-only="true"
      @confirm="handleWarehouseSelected"
    />

    <!-- 货物选择器 -->
    <GoodSelector
      v-model:visible="goodSelectorVisible"
      title="选择出库货物"
      :multiple="true"
      :show-stock="true"
      :warehouse-id="form.warehouseId"
      @confirm="handleGoodsSelected"
    />

    <!-- 创建出库单对话框 -->
    <el-dialog
      title="创建出库单"
      v-model="createDialogVisible"
      width="900px"
      :before-close="handleDialogClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库" prop="warehouseId">
              <el-input
                v-model="form.warehouseName"
                placeholder="请选择仓库"
                readonly
                @focus="showWarehouseSelectorForForm"
              >
                <template #suffix>
                  <i class="el-icon-search el-input__icon" style="cursor: pointer;" @click="showWarehouseSelectorForForm" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库类型" prop="outType">
              <el-select v-model="form.outType" placeholder="请选择出库类型" style="width: 100%;">
                <el-option
                  v-for="item in outboundTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标单号" prop="targetOrderNo">
              <el-input v-model="form.targetOrderNo" placeholder="请输入目标单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标单ID">
              <el-input v-model="form.targetOrderId" placeholder="请输入目标单ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>

        <el-divider content-position="left">出库明细</el-divider>
        <el-button type="primary" size="small" icon="el-icon-plus" style="margin-bottom: 10px;" @click="addItem">
          选择货物
        </el-button>
        <el-table :data="form.items" border style="width: 100%">
          <el-table-column label="货物编号" width="150">
            <template #default="scope">
              <span>{{ scope.row.goodNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="货物名称" width="150">
            <template #default="scope">
              <span>{{ scope.row.goodName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="货物类型" width="120">
            <template #default="scope">
              <span>{{ scope.row.goodType }}</span>
            </template>
          </el-table-column>
          <el-table-column label="型号" width="120">
            <template #default="scope">
              <span>{{ scope.row.goodModel }}</span>
            </template>
          </el-table-column>
          <el-table-column label="可用库存" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStockTagType(scope.row.availableQuantity)" size="mini">
                {{ scope.row.availableQuantity || 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="出库数量" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.outQuantity"
                :min="1"
                :max="scope.row.availableQuantity"
                :precision="0"
                size="small"
                style="width: 100%;"
              />
            </template>
          </el-table-column>
          <!-- <el-table-column label="单位" width="80">
            <template #default="scope">
              <span>{{ scope.row.unit }}</span>
            </template>
          </el-table-column> -->
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeItem(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getOutboundPage,
  createOutbound,
  confirmOutbound,
  cancelOutbound
} from '@/api/inventory'
import {
  OUTBOUND_TYPE_OPTIONS,
  OUTBOUND_TYPE_MAP,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_MAP
} from '@/constants/inventory'
import WarehouseSelector from '@/components/WarehouseSelector'
import GoodSelector from '@/components/GoodSelector'

export default {
  name: 'OutboundManagement',
  components: {
    WarehouseSelector,
    GoodSelector
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      warehouseSelectorVisible: false,
      goodSelectorVisible: false,
      createDialogVisible: false,
      currentEditIndex: -1, // 当前编辑的明细行索引
      outboundTypeOptions: OUTBOUND_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      dateRange: [],

      // 搜索表单
      searchForm: {
        outType: '',
        status: '',
        warehouseId: '',
        warehouseName: '',
        startTime: '',
        endTime: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },

      // 表单数据
      form: {
        warehouseId: '',
        warehouseName: '',
        outType: '',
        targetOrderId: '',
        targetOrderNo: '',
        remark: '',
        items: []
      },

      // 表单验证规则
      rules: {
        warehouseId: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        outType: [
          { required: true, message: '请选择出库类型', trigger: 'change' }
        ],
        targetOrderNo: [
          { required: true, message: '请输入目标单号', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    // 获取列表数据
    async fetchList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.page,
          pageSize: this.pagination.size
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startTime = this.dateRange[0]
          params.endTime = this.dateRange[1]
        }
        const response = await getOutboundPage(params)
        if (response && response.data) {
          this.tableData = response.data.records || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取出库单列表失败:', error)
        this.$message.error('获取出库单列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        outType: '',
        status: '',
        warehouseId: '',
        warehouseName: '',
        startTime: '',
        endTime: ''
      }
      this.dateRange = []
      this.pagination.page = 1
      this.fetchList()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchList()
    },

    // 页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchList()
    },

    // 显示仓库选择器（搜索用）
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 显示仓库选择器（表单用）
    showWarehouseSelectorForForm() {
      this.warehouseSelectorVisible = true
    },

    // 仓库选择
    handleWarehouseSelected(warehouses) {
      if (warehouses && warehouses.length > 0) {
        if (this.createDialogVisible) {
          // 表单用
          this.form.warehouseId = warehouses[0].id
          this.form.warehouseName = warehouses[0].warehouseName
        } else {
          // 搜索用
          this.searchForm.warehouseId = warehouses[0].id
          this.searchForm.warehouseName = warehouses[0].warehouseName
        }
      }
    },

    // 新增
    handleAdd() {
      this.resetForm()
      this.createDialogVisible = true
    },

    // 查看
    handleView(row) {
      this.$router.push({
        path: `/inventory/outbound/detail/${row.id}`
      })
    },

    // 确认出库
    handleConfirm(row) {
      this.$confirm('确定要确认出库吗？确认后将自动更新库存。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await confirmOutbound(row.id)
          this.$message.success('确认出库成功')
          this.fetchList()
        } catch (error) {
          console.error('确认出库失败:', error)
          this.$message.error('确认出库失败')
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 取消
    handleCancel(row) {
      this.$confirm('确定要取消该出库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await cancelOutbound(row.id)
          this.$message.success('取消成功')
          this.fetchList()
        } catch (error) {
          console.error('取消出库单失败:', error)
          this.$message.error('取消出库单失败')
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 添加明细项 - 打开货物选择器
    addItem() {
      // 检查是否已选择仓库
      if (!this.form.warehouseId) {
        this.$message.warning('请先选择仓库')
        return
      }
      this.goodSelectorVisible = true
    },

    // 处理货物选择
    handleGoodsSelected(goods) {
      if (!goods || goods.length === 0) {
        return
      }

      // 添加选择的货物到明细列表
      goods.forEach(good => {
        // 检查是否已经添加过该货物
        const exists = this.form.items.some(item => item.goodNo === good.goodNo)
        if (!exists) {
          this.form.items.push({
            goodNo: good.goodNo,
            goodName: good.goodName,
            goodType: good.goodType,
            goodModel: good.goodModel,
            unit: good.unit,
            availableQuantity: good.currentStock || 0,
            outQuantity: 1,
            remark: ''
          })
        }
      })
    },

    // 移除明细项
    removeItem(index) {
      this.form.items.splice(index, 1)
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }

        if (this.form.items.length === 0) {
          this.$message.warning('请至少添加一条出库明细')
          return
        }

        // 验证明细
        for (const item of this.form.items) {
          if (!item.goodNo || !item.goodName || !item.outQuantity) {
            this.$message.warning('请完整填写出库明细信息')
            return
          }
          // 检查出库数量是否超过可用库存
          if (item.outQuantity > item.availableQuantity) {
            this.$message.warning(`货物 ${item.goodName} 的出库数量不能超过可用库存 ${item.availableQuantity}`)
            return
          }
        }

        this.submitLoading = true
        try {
          await createOutbound(this.form)
          this.$message.success('创建成功')
          this.createDialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('创建出库单失败:', error)
          this.$message.error('创建出库单失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.createDialogVisible = false
      this.resetForm()
    },

    // 重置表单
    resetForm() {
      this.form = {
        warehouseId: '',
        warehouseName: '',
        outType: '',
        targetOrderId: '',
        targetOrderNo: '',
        remark: '',
        items: []
      }
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    // 获取出库类型文本
    getOutboundTypeText(type) {
      return OUTBOUND_TYPE_MAP[type] || type
    },

    // 获取出库类型标签
    getOutboundTypeTag(type) {
      const tagMap = {
        sale: 'success',
        damage: 'danger',
        transfer: 'info',
        other: ''
      }
      return tagMap[type] || ''
    },

    // 获取状态文本
    getOrderStatusText(status) {
      return ORDER_STATUS_MAP[status] || status
    },

    // 获取状态标签
    getOrderStatusTag(status) {
      const tagMap = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'info'
      }
      return tagMap[status] || ''
    },

    // 获取库存标签类型
    getStockTagType(quantity) {
      if (quantity <= 0) return 'danger'
      if (quantity < 10) return 'warning'
      return 'success'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
