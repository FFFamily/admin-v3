<template>
  <div class="wx-user-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.nickname" placeholder="昵称" class="filter-item" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.openid" placeholder="OpenID" class="filter-item" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增用户</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="openid" label="OpenID" width="250" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <span>{{ genderText(scope.row.gender) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column label="操作" width="160">
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="page"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'WxUserList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        nickname: '',
        openid: ''
      },
      loading: false
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    genderText(gender) {
      if (gender === 1) return '男'
      if (gender === 2) return '女'
      return '未知'
    },
    async fetchList() {
      this.loading = true
      // 这里请替换为你实际的 API 调用
      // 示例：const res = await getWxUserList({ page: this.page, pageSize: this.pageSize, ...this.search })
      // this.list = res.data.list
      // this.total = res.data.total
      setTimeout(() => {
        // mock 数据
        this.list = [
          { id: 1, nickname: '张三', openid: 'openid1', avatar: '', gender: 1, city: '北京' },
          { id: 2, nickname: '李四', openid: 'openid2', avatar: '', gender: 2, city: '上海' }
        ]
        this.total = 2
        this.loading = false
      }, 500)
    },
    handleAdd() {
      this.$message.info('新增用户功能待实现')
    },
    handleEdit(row) {
      this.$message.info('编辑功能待实现')
    },
    handleDelete(row) {
      this.$confirm('确定要删除该用户吗？', '提示', {
        type: 'warning'
      }).then(() => {
        // 这里请替换为你实际的删除 API
        this.$message.success('删除成功（模拟）')
        this.fetchList()
      })
    }
  }
}
</script>

<style scoped>
.wx-user-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style>
