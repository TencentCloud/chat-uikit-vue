<template>
  <ul class="adv-list">
    <li v-for="(item, index) of list" :key="index" :item="item">
      <slot name="item" :data="item" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps } from "../TUIKit/adapter-vue";
const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped lang="scss">
.adv-list {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

  li {
    width: 150px;
  }
}
</style>
