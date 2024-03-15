<template>
  <div :class="['message-abstract-image-container']">
    <img
      :class="['message-abstract-image']"
      :src="imageUrl"
    >
  </div>
</template>
<script setup lang="ts">
import { withDefaults, computed } from '../../../../../adapter-vue';
import { IImageMessageContent } from '../../../../../interface';
interface IProps {
  messageContent: Record<string, unknown> | IImageMessageContent | undefined;
}
const props = withDefaults(defineProps<IProps>(), {
  messageContent: () => ({}) as IImageMessageContent,
});

const imageUrl = computed<string>(() => (props.messageContent as IImageMessageContent).url || '');
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common";

.message-abstract-image-container {
  max-width: 100px;
  max-height: 100px;
  width: 100px;
  height: 100px;
  overflow: hidden;
  background-color: #fff;

  .message-abstract-image {
    max-width: 100px;
    max-height: 100px;
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
}
</style>
