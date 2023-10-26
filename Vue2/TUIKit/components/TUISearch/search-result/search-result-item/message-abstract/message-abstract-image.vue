<template>
  <div :class="['message-abstract-image']">
    <img :class="['messageImage']" :src="messageContent.url" />
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  messageContent: {
    type: Object,
    default: () => ({}),
  },
});
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common.scss";

.message-abstract-image {
  max-width: 100px;
  max-height: 100px;
  width: 100px;
  height: 100px;
  overflow: hidden;
  background-color: #ffffff;

  .messageImage {
    max-width: 100px;
    max-height: 100px;
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
}
</style>
