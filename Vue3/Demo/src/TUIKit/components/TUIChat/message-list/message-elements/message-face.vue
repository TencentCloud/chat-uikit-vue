<template>
  <div class="message-image" ref="skeleton">
    <!-- todo 统一组件处理-->
    <img class="message-image" :src="data.url" />
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref, nextTick } from "../../../../adapter-vue";
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  isPC: {
    type: Boolean,
    default: false,
  },
});
const data = ref();
const skeleton: any = ref();
watchEffect(() => {
  data.value = props.content;
  if (!data.value) return;
  nextTick(() => {
    // todo 大小显示
  });
});
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.message-image {
  width: 80px;
  height: 80px;
}
</style>
