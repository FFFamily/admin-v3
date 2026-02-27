<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
const name = computed(() => userStore.name)
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
