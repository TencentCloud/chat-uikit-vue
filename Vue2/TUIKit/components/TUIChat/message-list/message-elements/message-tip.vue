<template>
  <div class="message-tip">
    <span>{{ content.text }}</span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "../../../../adapter-vue";
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.message-tip {
  margin: 0 auto;
  color: #999999;
  font-size: 12px;
  width: -webkit-fill-available;
  overflow-wrap: anywhere;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  text-align: center;
}
</style>
