<template>
  <div class="progress-message">
    <slot />
    <div
      v-if="props.messageItem.status === 'unSend' && props.messageItem.progress < 1"
      class="progress-container"
    >
      <progress
        v-if="!isUniFrameWork"
        class="progress"
        :value="props.messageItem.progress"
        max="1"
      />
      <progress
        v-else
        activeColor="#006EFF"
        class="progress-common"
        :percent="Math.round(props.messageItem.progress*100)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { withDefaults } from '../../../adapter-vue';
import { isUniFrameWork } from '../../../utils/env';
import type { IImageMessageContent } from '../../../interface';

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
</script>

<style lang="scss" scoped>
$primary-progress-color: #006eff;
$primary-progress-bg-color: #fff;

.progress-message {
  overflow: hidden;

  .progress-container {
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

    .progress-common {
      appearance: none;
      width: 100%;
      height: 0.5rem;
    }

    .progress {
      @extend .progress-common;

      color: $primary-progress-color;
      border-radius: 0.25rem;
      background: $primary-progress-bg-color;

      &::-webkit-progress-value {
        background-color: $primary-progress-color;
        border-radius: 0.25rem;
      }

      &::-webkit-progress-bar {
        border-radius: 0.25rem;
        background: $primary-progress-bg-color;
      }

      &::-moz-progress-bar {
        color: $primary-progress-color;
        background: $primary-progress-color;
        border-radius: 0.25rem;
      }
    }
  }
}
</style>
