<template>
<div>
    <span v-for="(item, index) in data.text" :key="index">
      <span class="text-box" v-if="item.name === 'text'">{{ item.text }}</span>
      <img class="text-img" v-else :src="item.src" />
  </span>
</div>
</template>

<script lang="ts" setup>
import { defineProps, watchEffect, ref } from "../../../../adapter-vue";
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
const data = ref();
watchEffect(() => {
  data.value = props.content;
});
</script>
<style lang="scss" scoped>
.text-img {
  width: 20px;
  height: 20px;
}
.text-box {
  white-space: pre-wrap;
  font-size: inherit;
  word-break: break-word;
  font-size: 14px;
  text-size-adjust: none;
}
</style>
