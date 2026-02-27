<template>
  <div class="admin-user-selector-example">
    <h3>后台用户选择器使用示例</h3>

    <!-- 单选示例 -->
    <div class="example-section">
      <h4>单选模式</h4>
      <el-button type="primary" @click="showSingleSelector">
        选择后台用户（单选）
      </el-button>
      <div v-if="selectedSingleUser" class="selected-info">
        <p>已选择：{{ selectedSingleUser.nickname }} ({{ selectedSingleUser.username }})</p>
      </div>
    </div>

    <!-- 多选示例 -->
    <div class="example-section">
      <h4>多选模式</h4>
      <el-button type="success" @click="showMultipleSelector">
        选择后台用户（多选）
      </el-button>
      <div v-if="selectedMultipleUsers.length > 0" class="selected-info">
        <p>已选择 {{ selectedMultipleUsers.length }} 个后台用户：</p>
        <ul>
          <li v-for="user in selectedMultipleUsers" :key="user.id">
            {{ user.nickname }} ({{ user.username }})
          </li>
        </ul>
      </div>
    </div>

    <!-- 带禁用用户的示例 -->
    <div class="example-section">
      <h4>带禁用用户的多选模式</h4>
      <el-button type="warning" @click="showDisabledSelector">
        选择后台用户（禁用部分用户）
      </el-button>
      <div v-if="selectedDisabledUsers.length > 0" class="selected-info">
        <p>已选择 {{ selectedDisabledUsers.length }} 个后台用户：</p>
        <ul>
          <li v-for="user in selectedDisabledUsers" :key="user.id">
            {{ user.nickname }} ({{ user.username }})
          </li>
        </ul>
      </div>
    </div>

    <!-- 后台用户选择器组件 -->
    <AdminUserSelector
      v-model="singleSelectorVisible"
      title="选择后台用户（单选）"
      :multiple="false"
      @confirm="handleSingleConfirm"
    />

    <AdminUserSelector
      v-model="multipleSelectorVisible"
      title="选择后台用户（多选）"
      :multiple="true"
      @confirm="handleMultipleConfirm"
    />

    <AdminUserSelector
      v-model="disabledSelectorVisible"
      title="选择后台用户（部分禁用）"
      :multiple="true"
      :disabled-admin-users="disabledUserIds"
      @confirm="handleDisabledConfirm"
    />
  </div>
</template>

<script>
import AdminUserSelector from './index.vue'

export default {
  name: 'AdminUserSelectorExample',
  components: {
    AdminUserSelector
  },
  data() {
    return {
      // 单选相关
      singleSelectorVisible: false,
      selectedSingleUser: null,

      // 多选相关
      multipleSelectorVisible: false,
      selectedMultipleUsers: [],

      // 禁用用户相关
      disabledSelectorVisible: false,
      selectedDisabledUsers: [],
      disabledUserIds: [1, 2, 3] // 假设禁用ID为1,2,3的用户
    }
  },
  methods: {
    // 显示单选选择器
    showSingleSelector() {
      this.singleSelectorVisible = true
    },

    // 显示多选选择器
    showMultipleSelector() {
      this.multipleSelectorVisible = true
    },

    // 显示带禁用的选择器
    showDisabledSelector() {
      this.disabledSelectorVisible = true
    },

    // 单选确认
    handleSingleConfirm(users) {
      this.selectedSingleUser = users[0]
      this.$message.success(`已选择：${users[0].nickname}`)
    },

    // 多选确认
    handleMultipleConfirm(users) {
      this.selectedMultipleUsers = users
      this.$message.success(`已选择 ${users.length} 个后台用户`)
    },

    // 带禁用的多选确认
    handleDisabledConfirm(users) {
      this.selectedDisabledUsers = users
      this.$message.success(`已选择 ${users.length} 个后台用户`)
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-user-selector-example {
  padding: 20px;

  .example-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    h4 {
      margin-top: 0;
      color: #303133;
    }

    .selected-info {
      margin-top: 15px;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;

      p {
        margin: 0 0 10px 0;
        font-weight: 500;
        color: #606266;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 5px;
          color: #606266;
        }
      }
    }
  }
}
</style>
