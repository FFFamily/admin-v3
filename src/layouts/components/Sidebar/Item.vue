<template>
  <span class="menu-item">
    <template v-if="icon">
      <i v-if="icon.includes('el-icon')" :class="[icon, 'sub-el-icon']" />
      <svg-icon v-else :icon-class="icon" />
    </template>
    <span v-if="title" class="menu-title">{{ title }}</span>
  </span>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  }
})
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}

.menu-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
