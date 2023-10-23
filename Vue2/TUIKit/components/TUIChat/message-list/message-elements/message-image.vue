<template>
  <div class="imageContainer" @click.self="toggleShow" ref="skeletonDomRef">
    <img
      :class="['messageImage', !isPC && 'messageImage-h5']"
      :src="props.content.url"
      :width="props.content.width"
      :height="props.content.height"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  watch,
  onMounted,
  withDefaults,
  nextTick
} from "../../../../adapter-vue";
import { TUIGlobal, type IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { handleSkeletonSize } from '../../utils/utils';
import type { IImageMessageContent } from "../../../../interface";

const emits = defineEmits(["uploading", "previewImage"]);
const props = withDefaults(
  defineProps<{
    content: IImageMessageContent,
    messageItem: IMessageModel,
  }>(),
  {
    content: () => ({}),
    messageItem: () => ({} as IMessageModel),
  }
);

const isPC = TUIGlobal.getPlatform() === 'pc';
const skeletonDomRef = ref();

onMounted(() => {
  if (props.messageItem?.status === "success") {
    autoFixSkeletonSize();
  }
});

watch(() => props.messageItem?.status, (newVal: string, oldVal: string) => {
  if (newVal === "success" && newVal !== oldVal) {
    emits("uploading");
  }
});

watch(() => props.content.height, (newVal: number, oldVal: number) => {
  if (newVal > oldVal) {
    autoFixSkeletonSize();
  }
})

function autoFixSkeletonSize() {
  const { width = 0, height = 0 } = props.content;
    if (width === 0 || height === 0) return;
    const containerWidth = document.getElementById("app")?.clientWidth || 0;
    const max = !isPC ? Math.min(containerWidth - 180, 300) : 300;
    const size = handleSkeletonSize(width, height, max, max);
    skeletonDomRef?.value?.style &&
      (skeletonDomRef.value.style.width = `${size.width}px`);
    skeletonDomRef?.value?.style &&
      (skeletonDomRef.value.style.height = `${size.height}px`);
    nextTick(() => {
      emits('uploading');
    })
}

function toggleShow() {
  if (props.messageItem?.status === 'success' || props.messageItem?.progress === 1) {
    emits("previewImage", props.messageItem);
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";

.imageContainer {
  overflow: hidden;
  background-color: #f4f4f4;
  .messageImage {
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