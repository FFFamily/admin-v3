<template>
  <div v-if="!item.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <el-menu-item
        v-if="onlyOneChild.meta"
        :index="resolvePath(onlyOneChild.path)"
        :class="{ 'submenu-title-noDropdown': !isNest }"
        @click="handleLink(resolvePath(onlyOneChild.path))"
      >
        <Item :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" :title="onlyOneChild.meta.title" />
      </el-menu-item>
    </template>

    <el-sub-menu v-else ref="subMenuRef" :index="resolvePath(item.path)" popper-append-to-body>
      <template #title>
        <Item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { isExternal } from "@/utils/validate"
import { useAppStore } from "@/stores/app"
import Item from "./Item.vue"

defineOptions({ name: "SidebarItem" })

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ""
  }
})

const onlyOneChild = ref(null)
const router = useRouter()

const hasOneShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(child => {
    if (child.hidden) {
      return false
    }
    onlyOneChild.value = child
    return true
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true }
    return true
  }

  return false
}

const resolvePath = routePath => {
  if (!routePath) {
    return props.basePath
  }
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routePath.startsWith("/")) {
    return routePath
  }
  const base = props.basePath.endsWith("/") ? props.basePath.slice(0, -1) : props.basePath
  return `${base}/${routePath}`.replace(/\/+/g, "/")
}

const handleLink = to => {
  if (isExternal(to)) {
    window.open(to, "_blank", "noopener")
    return
  }
  router.push(to)
}

const subMenuRef = ref(null)
const appStore = useAppStore()
const device = computed(() => appStore.device)

const fixBugIniOS = () => {
  const subMenu = subMenuRef.value
  if (subMenu && subMenu.handleMouseleave) {
    const handleMouseleave = subMenu.handleMouseleave
    subMenu.handleMouseleave = e => {
      if (device.value === "mobile") {
        return
      }
      handleMouseleave(e)
    }
  }
}

onMounted(() => {
  fixBugIniOS()
})
</script>
