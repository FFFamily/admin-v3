<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device === 'mobile' && sidebarState.opened" class="drawer-bg" @click="handleClickOutside" />
    <SidebarComponent class="sidebar-container" />
    <div class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <Navbar />
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import Navbar from "./components/Navbar.vue"
import SidebarComponent from "./components/Sidebar/index.vue"
import AppMain from "./components/AppMain.vue"
import { useAppStore } from "@/stores/app"
import { useSettingsStore } from "@/stores/settings"

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const route = useRoute()

const sidebarState = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
  hideSidebar: !sidebarState.value.opened,
  openSidebar: sidebarState.value.opened,
  withoutAnimation: sidebarState.value.withoutAnimation,
  mobile: device.value === "mobile"
}))

const handleClickOutside = () => {
  appStore.closeSideBar({ withoutAnimation: false })
}

const WIDTH = 992
const body = document.body

const isMobile = () => body.getBoundingClientRect().width - 1 < WIDTH

const resizeHandler = () => {
  if (document.hidden) return
  const mobile = isMobile()
  appStore.toggleDevice(mobile ? "mobile" : "desktop")
  if (mobile) {
    appStore.closeSideBar({ withoutAnimation: true })
  }
}

onMounted(() => {
  window.addEventListener("resize", resizeHandler)
  if (isMobile()) {
    appStore.toggleDevice("mobile")
    appStore.closeSideBar({ withoutAnimation: true })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler)
})

watch(
  () => route.path,
  () => {
    if (device.value === "mobile" && sidebarState.value.opened) {
      appStore.closeSideBar({ withoutAnimation: false })
    }
  }
)
</script>

<style lang="scss" scoped>
@use "@/styles/mixin.scss" as *;
@use "@/styles/variables.scss" as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
</style>
