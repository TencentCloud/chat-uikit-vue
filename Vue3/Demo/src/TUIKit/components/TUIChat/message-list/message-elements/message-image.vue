<template>
  <div
    ref="skeletonDomRef"
    class="image-container"
    @click.self="toggleShow"
  >
    <img
      :class="['message-image', !isPC && 'message-image-h5']"
      :src="props.content.url"
      :width="props.content.width"
      :height="props.content.height"
    >
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, withDefaults } from '../../../../adapter-vue';
import { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { isPC } from '../../../../utils/env';
import { handleSkeletonSize } from '../../utils/utils';
import type { IImageMessageContent } from '../../../../interface';

const emits = defineEmits(['previewImage']);
const props = withDefaults(
  defineProps<{
    content: IImageMessageContent;
    messageItem: IMessageModel;
  }>(),
  {
    content: () => ({}),
    messageItem: () => ({} as IMessageModel),
  },
);
const skeletonDomRef = ref();

onMounted(() => {
  if (
    props.messageItem?.status === 'success'
    || props.messageItem?.status === 'fail'
    || props.messageItem?.progress === 1
  ) {
    autoFixSkeletonSize();
  }
});

watch(
  () => props.content.height,
  (newVal: number, oldVal: number) => {
    if (newVal > oldVal) {
      autoFixSkeletonSize();
    }
  },
);

function autoFixSkeletonSize() {
  const { width = 0, height = 0 } = props.content;
  if (width === 0 || height === 0) return;
  const containerWidth = document.getElementById('app')?.clientWidth || 0;
  const max = !isPC ? Math.min(containerWidth - 180, 300) : 300;
  const size = handleSkeletonSize(width, height, max, max);
  skeletonDomRef?.value?.style && (skeletonDomRef.value.style.width = `${size.width}px`);
  skeletonDomRef?.value?.style && (skeletonDomRef.value.style.height = `${size.height}px`);
}

function toggleShow() {
  if (props.messageItem?.status === 'success' || props.messageItem?.progress === 1) {
    emits('previewImage', props.messageItem);
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";

.image-container {
  overflow: hidden;
  background-color: #f4f4f4;

  .message-image {
    max-width: min(calc(100vw - 180px), 300px);
    max-height: min(calc(100vw - 180px), 300px);
    width: inherit;
    height: inherit;

    &-h5 {
      max-width: calc(100vw - 180px);
      max-height: calc(100vw - 180px);
    }
  }
}
</style>
