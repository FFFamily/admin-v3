<template>
  <el-container class="app-layout">
    <el-aside width="200px" class="app-aside">
      <div class="logo">Admin V3</div>
      <el-menu :default-active="activePath" router class="app-menu">
        <el-menu-item index="/dashboard">首页</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header">
        <div class="spacer" />
        <el-button size="small" @click="handleLogout">退出</el-button>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activePath = computed(() => route.path)

const handleLogout = async () => {
  await userStore.logout()
  router.push(`/login?redirect=${route.fullPath}`)
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-aside {
  border-right: 1px solid #e5e7eb;
  background: #fff;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.app-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.spacer {
  flex: 1;
}

.app-main {
  background: #f5f7f9;
}
</style>
