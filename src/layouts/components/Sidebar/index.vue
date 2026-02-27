<template>
  <div :class="{ 'has-logo': showLogo }">
    <Logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <SidebarItem v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useAppStore } from "@/stores/app"
import { useSettingsStore } from "@/stores/settings"
import { constantRoutes } from "@/router"

import Logo from "./Logo.vue"
import SidebarItem from "./SidebarItem.vue"
import variables from "@/styles/variables.module.scss"

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const routes = computed(() => constantRoutes)

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta && meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const showLogo = computed(() => settingsStore.sidebarLogo)
const isCollapse = computed(() => !appStore.sidebar.opened)
</script>
