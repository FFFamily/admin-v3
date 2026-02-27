<template>
  <div class="app-container">
    <!-- 搜索区域 -->

    <el-form :model="searchForm" :inline="true" class="search-form">
      <el-form-item label="账号名称">
        <el-input v-model="searchForm.accountName" placeholder="请输入用户名称" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="searchForm.realAddress" placeholder="请输入地址" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增地址</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户名称" prop="accountName" width="120" />
      <el-table-column label="分类" prop="category" width="100" />
      <el-table-column label="地址" prop="realAddress" min-width="200" show-overflow-tooltip />
      <el-table-column label="是否默认" prop="isDefault" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.isDefault === '1' ? 'success' : 'info'" size="mini">
            {{ scope.row.isDefault === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" width="150" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" width="180" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="success" :disabled="scope.row.isDefault === '1'" @click="handleSetDefault(scope.row)">设为默认</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" :before-close="handleDialogClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户" prop="accountId">
          <div class="user-selector-container">
          <el-input v-model="form.accountName" placeholder="请选择用户" readonly style="width: 100%;">
            <template #append>
              <el-button @click="showUserSelector">选择用户</el-button>
            </template>
          </el-input>
          </div>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-select v-model="form.province" placeholder="请选择省份" style="width: 100%;" @change="handleProvinceChange">
            <el-option v-for="province in provinceList" :key="province.code" :label="province.name" :value="province.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select v-model="form.city" placeholder="请选择城市" style="width: 100%;" :disabled="!form.province" @change="handleCityChange">
            <el-option v-for="city in cityList" :key="city.code" :label="city.name" :value="city.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-select v-model="form.district" placeholder="请选择区县" style="width: 100%;" :disabled="!form.city" @change="handleDistrictChange">
            <el-option v-for="district in districtList" :key="district.code" :label="district.name" :value="district.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="form.detailAddress" type="textarea" :rows="3" placeholder="请输入详细地址" @input="handleDetailAddressChange" />
        </el-form-item>
        <el-form-item label="完整地址" prop="realAddress">
          <el-input v-model="form.realAddress" type="textarea" :rows="2" placeholder="系统自动生成" readonly />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户选择器 -->
    <UserSelector v-model:visible="userSelectorVisible" title="选择用户" :multiple="false" @confirm="handleUserSelected" />

    <!-- 地址选择器示例 -->
    <AddressSelector v-model:visible="addressSelectorVisible" title="选择地址" :multiple="false" @confirm="handleAddressSelected" />
  </div>
</template>

<script>
import { getAddressPage, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'
import { getTopLevelCities, getChildrenCities } from '@/api/city'
import UserSelector from '@/components/UserSelector/index.vue'
import AddressSelector from '@/components/AddressSelector/index.vue'

export default {
  name: 'AddressManagement',
  components: {
    UserSelector,
    AddressSelector
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,
      userSelectorVisible: false,
      addressSelectorVisible: false,
      isEdit: false,
      selectedRows: [],

      // 搜索表单
      searchForm: {
        accountName: '',
        category: '',
        realAddress: ''
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
        id: '',
        accountId: '',
        accountName: '',
        category: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        realAddress: '',
        remark: ''
      },

      // 省市区数据
      provinceList: [],
      cityList: [],
      districtList: [],

      // 表单验证规则
      rules: {
        accountId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        province: [
          { required: true, message: '请选择省份', trigger: 'change' }
        ],
        city: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        district: [
          { required: true, message: '请选择区县', trigger: 'change' }
        ],
        detailAddress: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 5, message: '详细地址长度不能少于5个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑地址' : '新增地址'
    }
  },
  created() {
    this.fetchData()
    this.loadProvinceList()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.loading = true
      const params = {
        page: this.pagination.page,
        size: this.pagination.size,
        ...this.searchForm
      }

      getAddressPage(params).then(response => {
        this.tableData = response.data.records || []
        this.pagination.total = response.data.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        accountName: '',
        category: '',
        realAddress: ''
      }
      this.pagination.page = 1
      this.fetchData()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },

    // 新增
    handleAdd() {
      this.isEdit = false
      this.form = {
        id: '',
        accountId: '',
        accountName: '',
        category: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        realAddress: '',
        remark: ''
      }
      // 重置省市区数据
      this.cityList = []
      this.districtList = []
      this.dialogVisible = true
    },

    // 编辑
    handleEdit(row) {
      this.isEdit = true
      this.form = {
        id: row.id,
        accountId: row.accountId,
        accountName: row.accountName,
        category: row.category,
        province: row.province || '',
        city: row.city || '',
        district: row.district || '',
        detailAddress: row.detailAddress || '',
        realAddress: row.realAddress,
        remark: row.remark || ''
      }
      // 如果有省市区信息，需要加载对应的城市和区县数据
      if (row.province) {
        // 需要根据省份名称找到对应的code来加载城市数据
        const province = this.provinceList.find(p => p.name === row.province)
        if (province) {
          this.loadCityList(province.code)
          if (row.city) {
            const city = this.cityList.find(c => c.name === row.city)
            if (city) {
              this.loadDistrictList(city.code)
            }
          }
        }
      }
      this.dialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这条地址记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAddress(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        })
      })
    },

    // 设为默认地址
    handleSetDefault(row) {
      this.$confirm('确定要将此地址设为默认地址吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setDefaultAddress(row.id).then(() => {
          this.$message.success('设置默认地址成功')
          this.fetchData()
        }).catch(() => {
          this.$message.error('设置默认地址失败')
        })
      })
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的地址')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条地址记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deletePromises = this.selectedRows.map(row => deleteAddress(row.id))
        Promise.all(deletePromises).then(() => {
          this.$message.success('批量删除成功')
          this.selectedRows = []
          this.fetchData()
        }).catch(() => {
          this.$message.error('批量删除失败')
        })
      })
    },

    // 显示用户选择器
    showUserSelector() {
      this.userSelectorVisible = true
    },

    // 用户选择回调
    handleUserSelected(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.form.accountId = user.id
        this.form.accountName = user.nickname || user.username
      }
    },

    // 显示地址选择器
    showAddressSelector() {
      this.addressSelectorVisible = true
    },

    // 地址选择回调
    handleAddressSelected(addresses) {
      if (addresses && addresses.length > 0) {
        const address = addresses[0]
        this.$message.success(`选择了地址: ${address.accountName} - ${address.realAddress}`)
        console.log('选中的地址:', address)
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const submitData = { ...this.form }

          const request = this.isEdit ? updateAddress(submitData) : createAddress(submitData)

          request.then(() => {
            this.$message.success(this.isEdit ? '更新成功' : '创建成功')
            this.dialogVisible = false
            this.fetchData()
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },

    // 获取分类标签类型
    getCategoryTagType(category) {
      const typeMap = {
        '家庭地址': 'success',
        '工作地址': 'primary',
        '其他地址': 'info'
      }
      return typeMap[category] || 'info'
    },

    // 加载省份列表
    async loadProvinceList() {
      try {
        const response = await getTopLevelCities()
        this.provinceList = response.data || []
      } catch (error) {
        console.error('加载省份列表失败:', error)
        this.$message.error('加载省份列表失败')
      }
    },

    // 省份变化处理
    async handleProvinceChange(provinceName) {
      // 清空城市和区县选择
      this.form.city = ''
      this.form.district = ''
      this.cityList = []
      this.districtList = []

      // 加载城市列表
      if (provinceName) {
        const province = this.provinceList.find(p => p.name === provinceName)
        if (province) {
          await this.loadCityList(province.code)
        }
      }

      // 更新完整地址
      this.updateFullAddress()
    },

    // 加载城市列表
    async loadCityList(provinceCode) {
      try {
        const response = await getChildrenCities(provinceCode)
        this.cityList = response.data || []
      } catch (error) {
        console.error('加载城市列表失败:', error)
        this.$message.error('加载城市列表失败')
      }
    },

    // 城市变化处理
    async handleCityChange(cityName) {
      // 清空区县选择
      this.form.district = ''
      this.districtList = []

      // 加载区县列表
      if (cityName) {
        const city = this.cityList.find(c => c.name === cityName)
        if (city) {
          await this.loadDistrictList(city.code)
        }
      }

      // 更新完整地址
      this.updateFullAddress()
    },

    // 加载区县列表
    async loadDistrictList(cityCode) {
      try {
        const response = await getChildrenCities(cityCode)
        this.districtList = response.data || []
      } catch (error) {
        console.error('加载区县列表失败:', error)
        this.$message.error('加载区县列表失败')
      }
    },

    // 区县变化处理
    handleDistrictChange(districtName) {
      // 更新完整地址
      this.updateFullAddress()
    },

    // 详细地址变化处理
    handleDetailAddressChange() {
      // 更新完整地址
      this.updateFullAddress()
    },

    // 更新完整地址
    updateFullAddress() {
      const addressParts = []

      if (this.form.province) {
        addressParts.push(this.form.province)
      }
      if (this.form.city) {
        addressParts.push(this.form.city)
      }
      if (this.form.district) {
        addressParts.push(this.form.district)
      }
      if (this.form.detailAddress) {
        addressParts.push(this.form.detailAddress)
      }

      this.form.realAddress = addressParts.join('')
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.operation-card {
  margin-bottom: 20px;
}

.user-selector-container {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}
</style>
