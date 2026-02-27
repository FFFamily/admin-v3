<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="clearfix">
          <span>服务范围管理 - {{ userName }}</span>
          <div style="float: right;">
            <el-button type="primary" size="small" :loading="saveLoading" @click="handleSaveAll">保存</el-button>
            <el-button style="margin-left: 10px;" type="default" size="small" @click="handleAdd">新增服务范围</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="省份" prop="province" width="120" />
        <el-table-column label="城市" prop="city" width="120" />
        <el-table-column label="区县" prop="district" width="120" />
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="省份" prop="province">
          <el-select v-model="form.province" placeholder="请选择省份" style="width: 100%;" @change="handleProvinceChange">
            <el-option v-for="province in provinceList" :key="province.code" :label="province.name" :value="province.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select
            v-model="form.city"
            placeholder="请选择城市（可选）"
            style="width: 100%;"
            :disabled="!form.province"
            @change="handleCityChange"
            clearable
          >
            <el-option v-for="city in cityList" :key="city.code" :label="city.name" :value="city.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-select
            v-model="form.district"
            placeholder="请选择区县（可选，需先选择城市）"
            style="width: 100%;"
            :disabled="!form.city"
            clearable
          >
            <el-option v-for="district in districtList" :key="district.code" :label="district.name" :value="district.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getTopLevelCities, getChildrenCities } from '@/api/city'
// 这里的具体服务范围增删改查接口命名，可以根据后端实际路径调整
// 示例：一个服务范围表，按 serviceProviderId 过滤
import {
  getServiceScopeList,
  updateServiceScopeBatch
} from '@/api/serviceScope'

export default {
  name: 'ServiceScopeManagement',
  data() {
    return {
      userId: this.$route.params.userId,
      userName: this.$route.query.nickname || '',
      loading: false,
      submitLoading: false,
      saveLoading: false,
      dialogVisible: false,
      isEdit: false,
      editingIndex: -1, // 编辑时的索引
      tableData: [], // 本地临时数据数组

      // 表单
      form: {
        id: '',
        accountId: '',
        province: '',
        city: '',
        district: ''
      },

      // 省市区数据
      provinceList: [],
      cityList: [],
      districtList: [],

      rules: {
        province: [
          { required: true, message: '请选择省份', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑服务范围' : '新增服务范围'
    }
  },
  created() {
    if (!this.userId) {
      this.$message.error('缺少服务商ID')
      this.$router.back()
      return
    }
    this.fetchData()
    this.loadProvinceList()
  },
  methods: {
    // 查询当前服务商的服务范围列表
    fetchData() {
      this.loading = true
      getServiceScopeList(this.userId).then(res => {
        // 接口返回的数据结构：id, accountId, accountName, province, city, district
        this.tableData = res.data || []
      }).catch(err => {
        console.error('获取服务范围列表失败:', err)
        this.$message.error('获取服务范围列表失败')
        this.tableData = []
      }).finally(() => {
        this.loading = false
      })
    },
    handleAdd() {
      this.isEdit = false
      this.editingIndex = -1
      this.form = {
        id: '',
        accountId: this.userId,
        province: '',
        city: '',
        district: ''
      }
      this.cityList = []
      this.districtList = []
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      // 找到当前编辑项在 tableData 数组中的索引
      this.editingIndex = this.tableData.findIndex(item => {
        // 优先用 id 匹配（已保存的数据）
        if (row.id && item.id) {
          return item.id === row.id
        }
        // 如果是临时数据，用 tempId 匹配
        if (row.tempId && item.tempId) {
          return item.tempId === row.tempId
        }
        // 如果都没有，用对象引用匹配（同一行数据）
        return item === row
      })

      if (this.editingIndex === -1) {
        this.$message.error('未找到要编辑的数据')
        return
      }

      this.form = {
        id: row.id || '',
        accountId: this.userId,
        province: row.province || '',
        city: row.city || '',
        district: row.district || ''
      }
      // 回显省市区联动
      if (row.province) {
        const province = this.provinceList.find(p => p.name === row.province)
        if (province) {
          this.loadCityList(province.code).then(() => {
            if (row.city) {
              const city = this.cityList.find(c => c.name === row.city)
              if (city) {
                this.loadDistrictList(city.code)
              }
            }
          })
        }
      }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该服务范围吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从 tableData 数组中删除
        const index = this.tableData.findIndex(item => {
          // 优先用 id 匹配（已保存的数据）
          if (row.id && item.id) {
            return item.id === row.id
          }
          // 如果是临时数据，用 tempId 匹配
          if (row.tempId && item.tempId) {
            return item.tempId === row.tempId
          }
          // 如果都没有，用对象引用匹配（同一行数据）
          return item === row
        })

        if (index > -1) {
          this.tableData.splice(index, 1)
          this.$message.success('已删除（请点击保存按钮保存更改）')
        } else {
          this.$message.error('未找到要删除的数据')
        }
      })
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitLoading = true

        const formData = {
          id: this.form.id || undefined,
          accountId: this.userId,
          province: this.form.province,
          city: this.form.city || '',
          district: this.form.district || ''
        }

        if (this.isEdit && this.editingIndex > -1) {
          // 编辑：更新本地数组中的项（使用 Vue.set 确保响应式更新）
          const updatedItem = {
            ...this.tableData[this.editingIndex],
            ...formData
          }
          // 使用 Vue.set 或 splice 来触发响应式更新
          this.$set(this.tableData, this.editingIndex, updatedItem)
          // 或者使用 splice: this.tableData.splice(this.editingIndex, 1, updatedItem)
          this.$message.success('已更新（请点击保存按钮保存更改）')
        } else {
          // 新增：添加到本地数组
          const newItem = {
            ...formData,
            tempId: `temp_${Date.now()}_${Math.random()}` // 临时ID，用于区分新增项
          }
          this.tableData.push(newItem)
          this.$message.success('已添加（请点击保存按钮保存更改）')
        }

        this.dialogVisible = false
        this.submitLoading = false
        this.editingIndex = -1
      })
    },
    // 批量保存所有服务范围
    handleSaveAll() {
      if (this.tableData.length === 0) {
        this.$message.warning('请至少添加一条服务范围')
        return
      }

      this.saveLoading = true
      const submitData = {
        accountId: this.userId,
        serviceScopeList: this.tableData.map(item => ({
          id: item.id || undefined,
          province: item.province,
          city: item.city || '',
          district: item.district || ''
        }))
      }

      updateServiceScopeBatch(submitData).then(() => {
        this.$message.success('保存成功')
        // 重新获取数据，更新ID等信息
        this.fetchData()
      }).catch(err => {
        console.error('保存失败:', err)
        this.$message.error('保存失败')
      }).finally(() => {
        this.saveLoading = false
      })
    },
    // 省市区联动，复用地址管理里的逻辑
    async loadProvinceList() {
      try {
        const res = await getTopLevelCities()
        this.provinceList = res.data || []
      } catch (e) {
        this.$message.error('加载省份列表失败')
      }
    },
    async handleProvinceChange(provinceName) {
      this.form.city = ''
      this.form.district = ''
      this.cityList = []
      this.districtList = []
      if (provinceName) {
        const province = this.provinceList.find(p => p.name === provinceName)
        if (province) {
          await this.loadCityList(province.code)
        }
      }
    },
    async loadCityList(provinceCode) {
      try {
        const res = await getChildrenCities(provinceCode)
        this.cityList = res.data || []
        return this.cityList
      } catch (e) {
        this.$message.error('加载城市列表失败')
      }
    },
    async handleCityChange(cityName) {
      this.form.district = ''
      this.districtList = []
      if (cityName) {
        const city = this.cityList.find(c => c.name === cityName)
        if (city) {
          await this.loadDistrictList(city.code)
        }
      }
    },
    async loadDistrictList(cityCode) {
      try {
        const res = await getChildrenCities(cityCode)
        this.districtList = res.data || []
        return this.districtList
      } catch (e) {
        this.$message.error('加载区县列表失败')
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
