<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatarWithSize" class="user-avatar" />
          <el-icon class="caret-icon">
            <CaretBottom />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link to="/">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="logout">
              <span style="display: block;">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { CaretBottom } from "@element-plus/icons-vue"

import Breadcrumb from "@/components/Breadcrumb/index.vue"
import Hamburger from "@/components/Hamburger/index.vue"
import { useAppStore } from "@/stores/app"
import { useUserStore } from "@/stores/user"

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const sidebar = computed(() => appStore.sidebar)
const avatar = computed(() => userStore.avatar || "https://wpimg.wallstcn.com/69a1c46c-eb1c-4b46-8bd4-e9e686ef5251.png")
const avatarWithSize = computed(() => `${avatar.value}?imageView2/1/w/80/h/80`)

const toggleSideBar = () => {
  appStore.toggleSideBar()
}

const logout = async () => {
  await userStore.logout()
  router.push(`/login?redirect=${route.fullPath}`)
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
      }

      .caret-icon {
        font-size: 12px;
      }
    }
  }
}
</style>
