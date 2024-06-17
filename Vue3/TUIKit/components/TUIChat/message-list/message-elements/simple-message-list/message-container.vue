<template>
  <div class="simple-message-container">
    <div class="simple-message-avatar">
      <Avatar :url="props.avatar" />
    </div>
    <div>
      <div class="simple-message-sender">
        {{ props.sender }}
      </div>
      <div class="simple-message-body">
        <div
          :class="{
            'simple-message-content': true,
            'no-padding': isNoPadding
          }"
        >
          <slot />
        </div>
        <div class="timestamp">
          {{ calculateTimestamp(props.time*1000) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '../../../../../adapter-vue';
import TUIChatEngine from '@tencentcloud/chat-uikit-engine';
import Avatar from '../../../../common/Avatar/index.vue';
import { calculateTimestamp } from '../../../utils/utils';

interface IProps {
  sender: string;
  avatar: string;
  type: string;
  time: number;
}

const props = withDefaults(defineProps<IProps>(), {
  sender: '',
  avatar: '',
});

const TYPES = TUIChatEngine.TYPES;

const isNoPadding = computed(() => {
  return [TYPES.MSG_IMAGE, TYPES.MSG_VIDEO, TYPES.MSG_MERGER].includes(props.type);
});
</script>

<style scoped lang="scss">
:not(not){
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box;
}

.simple-message-container {
  flex-direction: row;

  .simple-message-avatar {
    flex: 0 0 auto;
    margin-right: 8px;
  }

  .simple-message-sender {
    display: block;
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 11px;
    color: #999;
  }

  .simple-message-body {
    flex-direction: row;
    align-items: flex-end;
  }

  .simple-message-content {
    margin-top: 8px;
    background-color: #dceafd;
    border-radius: 0 10px 10px;
    padding: 10px 12px;
  }

  .timestamp {
    flex: 0 0 auto;
    font-size: 12px;
    color: #aaa;
    margin-left: 6px;
  }

  .no-padding {
    padding: 0;
    background-color: transparent;
  }
}
</style>
