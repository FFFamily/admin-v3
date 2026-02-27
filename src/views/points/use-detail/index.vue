<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户积分兑换管理</span>
          <el-button type="primary" size="small" icon="el-icon-gift" @click="handleExchangeGoods">兑换商品</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="兑换码">
          <el-input
            v-model="searchForm.exchangeCode"
            placeholder="请输入兑换码"
            clearable
            style="width: 180px;"
          />
        </el-form-item>
        <el-form-item label="账户">
          <el-input
            v-model="searchForm.accountName"
            placeholder="请选择账户"
            readonly
            style="width: 180px;"
            @click="showUserSelector"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="showUserSelector" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="积分商品">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请选择积分商品"
            readonly
            style="width: 180px;"
            @click="showGoodsSelector"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="showGoodsSelector" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="使用状态">
          <el-select v-model="searchForm.isUsed" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="已使用" :value="true" />
            <el-option label="未使用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
        <el-table-column label="兑换码" prop="exchangeCode" width="200" align="center" show-overflow-tooltip />
        <el-table-column label="账户名称" prop="accountName" width="150" align="center" show-overflow-tooltip />
        <el-table-column label="积分商品" prop="goodsName" width="180" align="center" show-overflow-tooltip />
        <el-table-column label="消耗积分" prop="point" width="120" align="center">
          <template #default="scope">
            <span style="color: #e6a23c; font-weight: 600;">{{ scope.row.point || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="使用状态" prop="isUsed" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isUsed ? 'success' : 'info'" size="small">
              {{ scope.row.isUsed ? '已使用' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
            <el-button
              v-if="!scope.row.isUsed"
              size="mini"
              type="success"
              icon="el-icon-check"
              @click="handleConfirmUse(scope.row)"
            >确认使用</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-show="total > 0"
        :current-page="listQuery.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="listQuery.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <!-- 用户选择器 -->
      <UserSelector
        v-model:visible="userSelectorVisible"
        title="选择账户"
        :multiple="false"
        @confirm="handleUserConfirm"
        @close="handleUserClose"
      />

      <!-- 积分商品选择器（需要创建一个简单的选择器，或者使用现有的商品选择方式） -->
      <el-dialog
        title="选择积分商品"
        v-model="goodsSelectorVisible"
        width="800px"
        :close-on-click-modal="false"
      >
        <el-form :inline="true" :model="goodsSearchForm" style="margin-bottom: 20px;">
          <el-form-item label="商品名称">
            <el-input
              v-model="goodsSearchForm.name"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleGoodsSearch">搜索</el-button>
            <el-button @click="handleGoodsReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="goodsLoading"
          :data="goodsList"
          border
          highlight-current-row
          @row-click="handleGoodsRowClick"
        >
          <el-table-column label="商品名称" prop="goodsName" width="200" show-overflow-tooltip />
          <el-table-column label="所需积分" prop="pointPrice" width="120" align="center">
            <template #default="scope">
              <span style="color: #e6a23c; font-weight: 600;">{{ scope.row.pointPrice || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" width="100" align="center" />
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'info'" size="small">
                {{ scope.row.status === '1' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-show="goodsTotal > 0"
          :current-page="goodsQuery.pageNum"
          :page-sizes="[10, 20, 50]"
          :page-size="goodsQuery.pageSize"
          :total="goodsTotal"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 20px; text-align: right;"
          @size-change="handleGoodsSizeChange"
          @current-change="handleGoodsCurrentChange"
        />
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="goodsSelectorVisible = false">取消</el-button>
            <el-button type="primary" :disabled="!selectedGoods" @click="handleGoodsConfirm">确定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 详情对话框 -->
      <el-dialog
        title="兑换记录详情"
        v-model="detailVisible"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form label-width="100px">
          <el-form-item label="原因">
            <div style="padding: 10px 0;">{{ detailData.reason || '--' }}</div>
          </el-form-item>
          <el-form-item label="备注">
            <div style="padding: 10px 0;">{{ detailData.remark || '--' }}</div>
          </el-form-item>
          <el-form-item label="凭证">
            <div v-if="detailData.voucherImage" style="margin-top: 10px;">
              <el-image
                :src="getImageUrl(detailData.voucherImage)"
                :preview-src-list="[getImageUrl(detailData.voucherImage)]"
                fit="contain"
                style="max-width: 300px; max-height: 300px; cursor: pointer;"
              />
            </div>
            <div v-else style="padding: 10px 0;">--</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="detailVisible = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 兑换商品对话框 -->
      <el-dialog
        title="兑换商品"
        v-model="exchangeDialogVisible"
        width="600px"
        :close-on-click-modal="false"
        @close="handleExchangeDialogClose"
      >
        <el-form ref="exchangeForm" :model="exchangeForm" :rules="exchangeRules" label-width="120px">
          <el-form-item label="选择账户" prop="accountId">
            <el-input
              v-model="exchangeForm.accountName"
              placeholder="请选择账户"
              readonly
              style="width: 100%;"
              @click="showExchangeUserSelector"
            >
              <template #append>
                <el-button icon="el-icon-search" @click="showExchangeUserSelector" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="选择商品" prop="pointGoodsId">
            <el-input
              v-model="exchangeForm.goodsName"
              placeholder="请选择积分商品"
              readonly
              style="width: 100%;"
              @click="showExchangeGoodsSelector"
            >
              <template #append>
                <el-button icon="el-icon-search" @click="showExchangeGoodsSelector" />
              </template>
            </el-input>
            <div v-if="exchangeForm.point" style="margin-top: 8px; color: #909399; font-size: 12px;">
              所需积分：<span style="color: #e6a23c; font-weight: 600;">{{ exchangeForm.point }}</span>
            </div>
          </el-form-item>
          <el-form-item label="兑换码" prop="exchangeCode">
            <el-input
              v-model="exchangeForm.exchangeCode"
              placeholder="留空则自动生成兑换码"
              clearable
            />
            <div style="margin-top: 8px; color: #909399; font-size: 12px;">
              提示：如果不填写兑换码，系统将自动生成
            </div>
          </el-form-item>
          <el-form-item label="兑换原因" prop="reason">
            <el-input
              v-model="exchangeForm.reason"
              placeholder="请输入兑换原因"
              clearable
            />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="exchangeForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              clearable
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="exchangeDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="exchangeSubmitLoading" @click="handleExchangeSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 兑换用户选择器 -->
      <UserSelector
        v-model:visible="exchangeUserSelectorVisible"
        title="选择账户"
        :multiple="false"
        @confirm="handleExchangeUserConfirm"
        @close="handleExchangeUserClose"
      />

      <!-- 兑换商品选择器 -->
      <el-dialog
        title="选择积分商品"
        v-model="exchangeGoodsSelectorVisible"
        width="800px"
        :close-on-click-modal="false"
      >
        <el-form :inline="true" :model="goodsSearchForm" style="margin-bottom: 20px;">
          <el-form-item label="商品名称">
            <el-input
              v-model="goodsSearchForm.name"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleExchangeGoodsSearch">搜索</el-button>
            <el-button @click="handleExchangeGoodsReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="goodsLoading"
          :data="goodsList"
          border
          highlight-current-row
          @row-click="handleExchangeGoodsRowClick"
        >
          <el-table-column label="商品名称" prop="goodsName" width="200" show-overflow-tooltip />
          <el-table-column label="所需积分" prop="pointPrice" width="120" align="center">
            <template #default="scope">
              <span style="color: #e6a23c; font-weight: 600;">{{ scope.row.pointPrice || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" width="100" align="center" />
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'info'" size="small">
                {{ scope.row.status === '1' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-show="goodsTotal > 0"
          :current-page="goodsQuery.pageNum"
          :page-sizes="[10, 20, 50]"
          :page-size="goodsQuery.pageSize"
          :total="goodsTotal"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 20px; text-align: right;"
          @size-change="handleGoodsSizeChange"
          @current-change="handleGoodsCurrentChange"
        />
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="exchangeGoodsSelectorVisible = false">取消</el-button>
            <el-button type="primary" :disabled="!exchangeSelectedGoods" @click="handleExchangeGoodsConfirm">确定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 确认使用对话框 -->
      <el-dialog
        title="确认使用"
        v-model="confirmUseDialogVisible"
        width="600px"
        :close-on-click-modal="false"
        @close="handleConfirmUseDialogClose"
      >
        <el-form ref="confirmUseForm" :model="confirmUseForm" :rules="confirmUseRules" label-width="120px">
          <el-form-item label="凭证图片" prop="voucherImage">
            <ImageUploader
              v-model="confirmUseForm.voucherImage"
              :multiple="false"
              :limit="1"
              :emit-raw="true"
              tips="请上传凭证图片，支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="confirmUseDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="confirmUseSubmitLoading" @click="handleConfirmUseSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import UserSelector from '@/components/UserSelector'
import ImageUploader from '@/components/ImageUploader'
import { getPointsUseDetailPage, getPointsUseDetailInfo, getPointsGoodsPage, createPointsUseDetail, confirmUsePoints } from '@/api/points'

const BASE_API = (import.meta.env.VITE_BASE_API || '/api').replace(/\/+$/, '')

export default {
  name: 'PointsUseDetail',
  components: {
    UserSelector,
    ImageUploader
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        exchangeCode: '',
        accountId: '',
        accountName: '',
        pointGoodsId: '',
        goodsName: '',
        isUsed: null
      },
      // 列表数据
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },
      // 用户选择器控制
      userSelectorVisible: false,
      // 商品选择器控制
      goodsSelectorVisible: false,
      goodsLoading: false,
      goodsList: [],
      goodsTotal: 0,
      goodsQuery: {
        pageNum: 1,
        pageSize: 10
      },
      goodsSearchForm: {
        name: ''
      },
      selectedGoods: null,
      // 详情对话框
      detailVisible: false,
      detailData: {},
      // 兑换商品对话框
      exchangeDialogVisible: false,
      exchangeSubmitLoading: false,
      // 兑换表单数据
      exchangeForm: {
        accountId: '',
        accountName: '',
        pointGoodsId: '',
        goodsName: '',
        point: null,
        exchangeCode: '', // 可选，如果为空则由后端生成
        reason: '', // 兑换原因
        remark: '' // 备注
      },
      // 兑换表单验证规则
      exchangeRules: {
        accountId: [
          { required: true, message: '请选择账户', trigger: 'change' }
        ],
        pointGoodsId: [
          { required: true, message: '请选择积分商品', trigger: 'change' }
        ]
      },
      // 兑换用户选择器
      exchangeUserSelectorVisible: false,
      // 兑换商品选择器
      exchangeGoodsSelectorVisible: false,
      exchangeSelectedGoods: null,
      // 确认使用对话框
      confirmUseDialogVisible: false,
      confirmUseSubmitLoading: false,
      confirmUseForm: {
        id: '',
        voucherImage: ''
      },
      confirmUseRules: {
        voucherImage: [
          { required: true, message: '请上传凭证图片', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    async fetchData() {
      this.listLoading = true
      try {
        const params = {
          exchangeCode: this.searchForm.exchangeCode || undefined,
          accountId: this.searchForm.accountId || undefined,
          pointGoodsId: this.searchForm.pointGoodsId || undefined,
          isUsed: this.searchForm.isUsed !== null && this.searchForm.isUsed !== '' ? this.searchForm.isUsed : undefined,
          pageNum: this.listQuery.pageNum,
          pageSize: this.listQuery.pageSize
        }
        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        const response = await getPointsUseDetailPage(params)
        this.list = response.data.records || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取兑换记录失败:', error)
        this.list = []
        this.total = 0
        this.$message.error('获取兑换记录失败')
      } finally {
        this.listLoading = false
      }
    },

    // 搜索
    handleSearch() {
      this.listQuery.pageNum = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        exchangeCode: '',
        accountId: '',
        accountName: '',
        pointGoodsId: '',
        goodsName: '',
        isUsed: null
      }
      this.listQuery.pageNum = 1
      this.fetchData()
    },

    // 分页相关
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.fetchData()
    },

    // 显示用户选择器
    showUserSelector() {
      this.userSelectorVisible = true
    },

    // 用户选择确认
    handleUserConfirm(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.searchForm.accountId = user.id
        this.searchForm.accountName = user.nickname || user.username
      }
      this.userSelectorVisible = false
    },

    // 用户选择器关闭
    handleUserClose() {
      this.userSelectorVisible = false
    },

    // 显示商品选择器
    showGoodsSelector() {
      this.goodsSelectorVisible = true
      this.selectedGoods = null
      this.fetchGoodsList()
    },

    // 获取商品列表
    async fetchGoodsList() {
      this.goodsLoading = true
      try {
        const params = {
          goodsName: this.goodsSearchForm.name || undefined,
          status: '1', // 只显示上架的商品
          pageNum: this.goodsQuery.pageNum,
          pageSize: this.goodsQuery.pageSize
        }
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        const response = await getPointsGoodsPage(params)
        this.goodsList = response.data.records || []
        this.goodsTotal = response.data.total || 0
      } catch (error) {
        console.error('获取商品列表失败:', error)
        this.goodsList = []
        this.goodsTotal = 0
      } finally {
        this.goodsLoading = false
      }
    },

    // 商品搜索
    handleGoodsSearch() {
      this.goodsQuery.pageNum = 1
      this.fetchGoodsList()
    },

    // 商品重置
    handleGoodsReset() {
      this.goodsSearchForm.name = ''
      this.goodsQuery.pageNum = 1
      this.fetchGoodsList()
    },

    // 商品分页
    handleGoodsSizeChange(val) {
      this.goodsQuery.pageSize = val
      this.fetchGoodsList()
    },
    handleGoodsCurrentChange(val) {
      this.goodsQuery.pageNum = val
      this.fetchGoodsList()
    },

    // 商品行点击
    handleGoodsRowClick(row) {
      this.selectedGoods = row
    },

    // 商品选择确认
    handleGoodsConfirm() {
      if (this.selectedGoods) {
        this.searchForm.pointGoodsId = this.selectedGoods.id
        this.searchForm.goodsName = this.selectedGoods.goodsName
      }
      this.goodsSelectorVisible = false
    },

    // 查看详情
    async handleView(row) {
      try {
        const response = await getPointsUseDetailInfo(row.id)
        if (response && response.data) {
          this.detailData = response.data
          this.detailVisible = true
        } else {
          this.$message.error('获取详情数据为空')
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败，请稍后重试')
      }
    },

    // 兑换商品相关方法
    handleExchangeGoods() {
      this.exchangeDialogVisible = true
      this.exchangeForm = {
        accountId: '',
        accountName: '',
        pointGoodsId: '',
        goodsName: '',
        point: null,
        exchangeCode: '',
        reason: '',
        remark: ''
      }
    },

    // 显示兑换用户选择器
    showExchangeUserSelector() {
      this.exchangeUserSelectorVisible = true
    },

    // 兑换用户选择确认
    handleExchangeUserConfirm(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.exchangeForm.accountId = user.id
        this.exchangeForm.accountName = user.nickname || user.username
      }
      this.exchangeUserSelectorVisible = false
    },

    // 兑换用户选择器关闭
    handleExchangeUserClose() {
      this.exchangeUserSelectorVisible = false
    },

    // 显示兑换商品选择器
    showExchangeGoodsSelector() {
      this.exchangeGoodsSelectorVisible = true
      this.exchangeSelectedGoods = null
      this.fetchGoodsList()
    },

    // 兑换商品搜索
    handleExchangeGoodsSearch() {
      this.goodsQuery.pageNum = 1
      this.fetchGoodsList()
    },

    // 兑换商品重置
    handleExchangeGoodsReset() {
      this.goodsSearchForm.name = ''
      this.goodsQuery.pageNum = 1
      this.fetchGoodsList()
    },

    // 兑换商品行点击
    handleExchangeGoodsRowClick(row) {
      this.exchangeSelectedGoods = row
    },

    // 兑换商品选择确认
    handleExchangeGoodsConfirm() {
      if (this.exchangeSelectedGoods) {
        this.exchangeForm.pointGoodsId = this.exchangeSelectedGoods.id
        this.exchangeForm.goodsName = this.exchangeSelectedGoods.goodsName
        this.exchangeForm.point = this.exchangeSelectedGoods.pointPrice || null
      }
      this.exchangeGoodsSelectorVisible = false
    },

    // 兑换对话框关闭
    handleExchangeDialogClose() {
      this.$refs.exchangeForm && this.$refs.exchangeForm.resetFields()
      this.exchangeForm = {
        accountId: '',
        accountName: '',
        pointGoodsId: '',
        goodsName: '',
        point: null,
        exchangeCode: '',
        reason: '',
        remark: ''
      }
    },

    // 提交兑换
    async handleExchangeSubmit() {
      this.$refs.exchangeForm.validate(async(valid) => {
        if (valid) {
          this.exchangeSubmitLoading = true
          try {
            const submitData = {
              accountId: this.exchangeForm.accountId,
              pointGoodsId: this.exchangeForm.pointGoodsId,
              exchangeCode: this.exchangeForm.exchangeCode || undefined,
              reason: this.exchangeForm.reason || undefined,
              remark: this.exchangeForm.remark || undefined
            }
            await createPointsUseDetail(submitData)
            this.$message.success('兑换成功')
            this.exchangeDialogVisible = false
            // 刷新列表
            this.fetchData()
          } catch (error) {
            console.error('兑换失败:', error)
            this.$message.error('兑换失败，请稍后重试')
          } finally {
            this.exchangeSubmitLoading = false
          }
        }
      })
    },

    // 确认使用相关方法
    handleConfirmUse(row) {
      this.confirmUseForm = {
        id: row.id,
        voucherImage: ''
      }
      this.confirmUseDialogVisible = true
    },

    // 确认使用对话框关闭
    handleConfirmUseDialogClose() {
      this.$refs.confirmUseForm && this.$refs.confirmUseForm.resetFields()
      this.confirmUseForm = {
        id: '',
        voucherImage: ''
      }
    },

    // 提交确认使用
    async handleConfirmUseSubmit() {
      this.$refs.confirmUseForm.validate(async(valid) => {
        if (valid) {
          this.confirmUseSubmitLoading = true
          try {
            const submitData = {
              id: this.confirmUseForm.id,
              voucherImage: this.confirmUseForm.voucherImage
            }
            await confirmUsePoints(submitData)
            this.$message.success('确认使用成功')
            this.confirmUseDialogVisible = false
            // 刷新列表
            this.fetchData()
          } catch (error) {
            console.error('确认使用失败:', error)
            this.$message.error('确认使用失败，请稍后重试')
          } finally {
            this.confirmUseSubmitLoading = false
          }
        }
      })
    },

    // 工具方法
    formatDateTime(time) {
      return parseTime(time)
    },

    // 获取图片URL（处理相对路径和绝对路径）
    getImageUrl(url) {
      if (!url) return ''
      // 如果是绝对路径，直接返回
      if (/^(https?:)?\/\//.test(url)) {
        return url
      }
      return BASE_API + (url.startsWith('/') ? url : '/' + url)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 15px;
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>
