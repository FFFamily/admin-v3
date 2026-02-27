<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    width="800px"
    @close="handleClose"
  >
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="queryParams" class="search-form">
      <el-form-item label="站点名称">
        <el-input v-model="queryParams.name" placeholder="请输入站点名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
      ref="siteTable"
      v-loading="loading"
      :data="siteList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="multiple" type="selection" width="55" align="center" />
      <el-table-column v-else width="55" align="center">
        <template #default="scope">
          <el-radio v-model="selectedSiteId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="站点名称" align="center" />
      <el-table-column prop="address" label="站点地址" align="center" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="queryParams.page"
      :page-sizes="[10, 20, 50]"
      :page-size="queryParams.size"
      :total="total"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getSiteListPage } from '@/api/site'

export default {
  name: 'SiteSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择站点'
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      siteList: [],
      total: 0,
      queryParams: {
        page: 1,
        size: 10,
        name: ''
      },
      selectedSiteId: null,
      selectedSites: []
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.fetchList()
      }
    }
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const response = await getSiteListPage(this.queryParams)
        this.siteList = response.data.records || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取站点列表失败:', error)
        this.$message.error('获取站点列表失败')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.page = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        size: 10,
        name: ''
      }
      this.fetchList()
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.fetchList()
    },
    handleSelectionChange(selection) {
      this.selectedSites = selection
    },
    handleConfirm() {
      if (this.multiple) {
        if (this.selectedSites.length === 0) {
          this.$message.warning('请至少选择一个站点')
          return
        }
        this.$emit('confirm', this.selectedSites)
      } else {
        if (!this.selectedSiteId) {
          this.$message.warning('请选择一个站点')
          return
        }
        const selectedSite = this.siteList.find(site => site.id === this.selectedSiteId)
        this.$emit('confirm', [selectedSite])
      }
      this.handleClose()
    },
    handleClose() {
      this.selectedSiteId = null
      this.selectedSites = []
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
