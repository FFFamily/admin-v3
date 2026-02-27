<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
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
      <el-form-item label="货物编号">
        <el-input v-model="searchForm.goodNo" placeholder="请输入货物编号" clearable style="width: 180px;" />
      </el-form-item>
      <el-form-item label="货物名称">
        <el-input v-model="searchForm.goodName" placeholder="请输入货物名称" clearable style="width: 180px;" />
      </el-form-item>
      <el-form-item label="货物类型">
        <el-input v-model="searchForm.goodType" placeholder="请输入货物类型" clearable style="width: 150px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <!-- <el-button type="warning" icon="el-icon-warning" @click="showWarnings">库存预警</el-button> -->
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="warehouseName" label="仓库名称" width="150" />
      <el-table-column prop="goodNo" label="货物编号" width="150" />
      <el-table-column prop="goodName" label="货物名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="goodType" label="货物类型" width="120" />
      <el-table-column prop="goodModel" label="型号" width="120" show-overflow-tooltip />
      <el-table-column prop="currentStock" label="当前库存数量" width="120" align="center">
        <template #default="scope">
          <span>{{ scope.row.currentStock }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="availableQuantity" label="可用库存" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStockTag(scope.row.availableQuantity)" size="small">
            {{ scope.row.availableQuantity }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lockedQuantity" label="锁定库存" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.lockedQuantity > 0" type="warning" size="small">
            {{ scope.row.lockedQuantity }}
          </el-tag>
          <span v-else>0</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="minStock" label="安全库存" width="100" align="center" /> -->
      <!-- <el-table-column prop="unit" label="单位" width="80" align="center" /> -->
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <!-- <el-table-column label="操作" width="300" fixed="right">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleSetMinStock(scope.row)">设置安全库存</el-button>
          <el-button size="mini" type="warning" @click="handleLockStock(scope.row)">锁定库存</el-button>
          <el-button size="mini" type="success" :disabled="scope.row.lockedQuantity <= 0" @click="handleUnlockStock(scope.row)">解锁库存</el-button>
        </template>
      </el-table-column> -->
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

    <!-- 设置安全库存对话框 -->
    <el-dialog title="设置安全库存" v-model="minStockDialogVisible" width="400px">
      <el-form :model="minStockForm" label-width="100px">
        <el-form-item label="货物名称">
          <el-input :value="minStockForm.goodName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="minStockForm.totalQuantity" disabled />
        </el-form-item>
        <el-form-item label="安全库存" required>
          <el-input-number
            v-model="minStockForm.minStock"
            :min="0"
            :max="9999999"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="minStockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitMinStock">确定</el-button>
      </template>
    </el-dialog>

    <!-- 锁定库存对话框 -->
    <el-dialog title="锁定库存" v-model="lockStockDialogVisible" width="400px">
      <el-form :model="lockStockForm" label-width="100px">
        <el-form-item label="货物名称">
          <el-input :value="lockStockForm.goodName" disabled />
        </el-form-item>
        <el-form-item label="可用库存">
          <el-input :value="lockStockForm.availableQuantity" disabled />
        </el-form-item>
        <el-form-item label="锁定数量" required>
          <el-input-number
            v-model="lockStockForm.quantity"
            :min="1"
            :max="lockStockForm.availableQuantity"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="lockStockForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="lockStockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitLockStock">确定</el-button>
      </template>
    </el-dialog>

    <!-- 解锁库存对话框 -->
    <el-dialog title="解锁库存" v-model="unlockStockDialogVisible" width="400px">
      <el-form :model="unlockStockForm" label-width="100px">
        <el-form-item label="货物名称">
          <el-input :value="unlockStockForm.goodName" disabled />
        </el-form-item>
        <el-form-item label="锁定库存">
          <el-input :value="unlockStockForm.lockedQuantity" disabled />
        </el-form-item>
        <el-form-item label="解锁数量" required>
          <el-input-number
            v-model="unlockStockForm.quantity"
            :min="1"
            :max="unlockStockForm.lockedQuantity"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="unlockStockForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unlockStockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitUnlockStock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getWarehouse,
  getInventoryPage,
  getInventoryWarning,
  setMinStock,
  lockStock,
  unlockStock
} from '@/api/inventory'
import WarehouseSelector from '@/components/WarehouseSelector'

export default {
  name: 'InventoryList',
  components: {
    WarehouseSelector
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      warehouseSelectorVisible: false,
      minStockDialogVisible: false,
      lockStockDialogVisible: false,
      unlockStockDialogVisible: false,

      // 搜索表单
      searchForm: {
        warehouseId: '',
        warehouseName: '',
        goodNo: '',
        goodName: '',
        goodType: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },

      // 设置安全库存表单
      minStockForm: {
        id: '',
        goodName: '',
        totalQuantity: 0,
        minStock: 0
      },

      // 锁定库存表单
      lockStockForm: {
        inventoryId: '',
        goodName: '',
        availableQuantity: 0,
        quantity: 1,
        remark: ''
      },

      // 解锁库存表单
      unlockStockForm: {
        inventoryId: '',
        goodName: '',
        lockedQuantity: 0,
        quantity: 1,
        remark: ''
      }
    }
  },
  mounted() {
    this.initFromRoute()
    this.fetchList()
  },
  methods: {
    async initFromRoute() {
      const { warehouseId, goodNo } = this.$route.query || {}
      if (warehouseId) {
        this.searchForm.warehouseId = String(warehouseId)
        // 尽量补齐名称（仅用于显示）
        if (!this.searchForm.warehouseName) {
          try {
            const resp = await getWarehouse(this.searchForm.warehouseId)
            if (resp && resp.data) {
              this.searchForm.warehouseName = resp.data.warehouseName || ''
            }
          } catch (e) {
            // ignore: 不影响查询
          }
        }
      }
      if (goodNo) {
        this.searchForm.goodNo = String(goodNo)
      }
    },
    // 获取列表数据
    async fetchList() {
      this.loading = true
      try {
        const data = {
          ...this.searchForm,
          pageNum: this.pagination.page,
          pageSize: this.pagination.size
        }
        const response = await getInventoryPage(data)
        if (response && response.data) {
          this.tableData = response.data.records || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取库存列表失败:', error)
        this.$message.error('获取库存列表失败')
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
        warehouseId: '',
        warehouseName: '',
        goodNo: '',
        goodName: '',
        goodType: ''
      }
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

    // 显示仓库选择器
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 仓库选择
    handleWarehouseSelected(warehouses) {
      if (warehouses && warehouses.length > 0) {
        this.searchForm.warehouseId = warehouses[0].id
        this.searchForm.warehouseName = warehouses[0].warehouseName
      }
    },

    // 显示库存预警
    async showWarnings() {
      this.loading = true
      try {
        const params = {}
        if (this.searchForm.warehouseId) {
          params.warehouseId = this.searchForm.warehouseId
        }
        const response = await getInventoryWarning(params)
        if (response && response.data) {
          const warnings = response.data || []
          if (warnings.length === 0) {
            this.$message.success('暂无库存预警')
          } else {
            this.tableData = warnings
            this.pagination.total = warnings.length
            this.$message.warning(`发现 ${warnings.length} 条库存预警`)
          }
        }
      } catch (error) {
        console.error('获取库存预警失败:', error)
        this.$message.error('获取库存预警失败')
      } finally {
        this.loading = false
      }
    },

    // 设置安全库存
    handleSetMinStock(row) {
      this.minStockForm = {
        id: row.id,
        goodName: row.goodName,
        totalQuantity: row.totalQuantity,
        minStock: row.minStock || 0
      }
      this.minStockDialogVisible = true
    },

    // 提交安全库存
    async submitMinStock() {
      this.submitLoading = true
      try {
        await setMinStock({
          inventoryId: this.minStockForm.id,
          minStock: this.minStockForm.minStock
        })
        this.$message.success('设置成功')
        this.minStockDialogVisible = false
        this.fetchList()
      } catch (error) {
        console.error('设置安全库存失败:', error)
        this.$message.error('设置安全库存失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 锁定库存
    handleLockStock(row) {
      if (row.availableQuantity <= 0) {
        this.$message.warning('可用库存不足，无法锁定')
        return
      }
      this.lockStockForm = {
        inventoryId: row.id,
        goodName: row.goodName,
        availableQuantity: row.availableQuantity,
        quantity: 1,
        remark: ''
      }
      this.lockStockDialogVisible = true
    },

    // 提交锁定库存
    async submitLockStock() {
      if (this.lockStockForm.quantity <= 0) {
        this.$message.warning('锁定数量必须大于0')
        return
      }
      if (this.lockStockForm.quantity > this.lockStockForm.availableQuantity) {
        this.$message.warning('锁定数量不能大于可用库存')
        return
      }

      this.submitLoading = true
      try {
        await lockStock({
          inventoryId: this.lockStockForm.inventoryId,
          quantity: this.lockStockForm.quantity,
          remark: this.lockStockForm.remark
        })
        this.$message.success('锁定成功')
        this.lockStockDialogVisible = false
        this.fetchList()
      } catch (error) {
        console.error('锁定库存失败:', error)
        this.$message.error('锁定库存失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 解锁库存
    handleUnlockStock(row) {
      if (row.lockedQuantity <= 0) {
        this.$message.warning('没有锁定的库存')
        return
      }
      this.unlockStockForm = {
        inventoryId: row.id,
        goodName: row.goodName,
        lockedQuantity: row.lockedQuantity,
        quantity: 1,
        remark: ''
      }
      this.unlockStockDialogVisible = true
    },

    // 提交解锁库存
    async submitUnlockStock() {
      if (this.unlockStockForm.quantity <= 0) {
        this.$message.warning('解锁数量必须大于0')
        return
      }
      if (this.unlockStockForm.quantity > this.unlockStockForm.lockedQuantity) {
        this.$message.warning('解锁数量不能大于锁定库存')
        return
      }

      this.submitLoading = true
      try {
        await unlockStock({
          inventoryId: this.unlockStockForm.inventoryId,
          quantity: this.unlockStockForm.quantity,
          remark: this.unlockStockForm.remark
        })
        this.$message.success('解锁成功')
        this.unlockStockDialogVisible = false
        this.fetchList()
      } catch (error) {
        console.error('解锁库存失败:', error)
        this.$message.error('解锁库存失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 获取库存标签类型
    getStockTag(quantity) {
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
