<template>
  <div class="progressMessage">
    <slot></slot>
    <div
      v-if="props.messageItem.status === 'unSend' && props.messageItem.progress < 1"
      class="progressContainer"
    >
      <progress
        v-if="!isUniFrameWork"
        class="progress"
        :value="props.messageItem.progress"
        max="1"
      ></progress>
      <progress
        v-else
        activeColor="#006EFF"
        class="progressCommon"
        :percent="Math.round(props.messageItem.progress*100)"
      ></progress>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { withDefaults, watch, watchEffect } from "../../../adapter-vue";
import { isUniFrameWork } from "../../../utils/env";
import type { IImageMessageContent } from "../../../interface";

const props = withDefaults(
  defineProps<{
    content: IImageMessageContent;
    messageItem: IMessageModel;
  }>(),
  {
    content: () => ({}),
    messageItem: () => ({} as IMessageModel),
  }
);
</script>

<style lang="scss" scoped>
$primaryProgressColor: #006eff;
$primaryProgressBgColor: #fff;
.progressMessage {
  overflow: hidden;

  .progressContainer {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0 15%;
    left: 0;
    top: 0;
    background: rgba(#000, 0.5);
    display: flex;
    align-items: center;

    .progressCommon {
      appearance: none;
      width: 100%;
      height: 0.5rem;
    }
    .progress {
      @extend .progressCommon;
      color: $primaryProgressColor;
      border-radius: 0.25rem;
      background: $primaryProgressBgColor;

      &::-webkit-progress-value {
        background-color: $primaryProgressColor;
        border-radius: 0.25rem;
      }

      &::-webkit-progress-bar {
        border-radius: 0.25rem;
        background: $primaryProgressBgColor;
      }

      &::-moz-progress-bar {
        color: $primaryProgressColor;
        background: $primaryProgressColor;
        border-radius: 0.25rem;
      }
    }
  }
}
</style>
