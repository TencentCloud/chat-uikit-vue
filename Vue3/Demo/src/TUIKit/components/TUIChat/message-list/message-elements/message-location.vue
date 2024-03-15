<template>
  <a
    class="message-location"
    :href="data.href"
    target="_blank"
    title="点击查看详情"
  >
    <span class="el-icon-location-outline">{{ data.description }}</span>
    <img :src="data.url">
  </a>
</template>

<script lang="ts" setup>
import { watchEffect, ref } from '../../../../adapter-vue';
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
@import "../../../../assets/styles/common";

.message-location {
  display: flex;
  flex-direction: column;
}
</style>
