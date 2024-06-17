<template>
  <div class="message-plugin">
    <!-- The following is displayed in the form of messageTip -->
    <div
      v-if="props.showStyle === 'tip'"
      class="message-plugin-tip"
    >
      <slot name="messageTip" />
    </div>
    <!-- The following is displayed in the form of messageBubble -->
    <div
      v-else-if="props.showStyle === 'bubble'"
      class="message-plugin-bubble-content"
      @longpress="handleToggleMessageItem($event, messageModel, true)"
      @click.prevent.right="handleToggleMessageItem($event, messageModel)"
      @touchstart="handleH5LongPress($event, messageModel, 'touchstart')"
      @touchend="handleH5LongPress($event, messageModel, 'touchend')"
      @mouseover="handleH5LongPress($event, messageModel, 'touchend')"
    >
      <MessageBubble
        :messageItem="messageModel"
        :content="messageModel.getMessageContent()"
        :blinkMessageIDList="props.blinkMessageIDList"
        :classNameList="props.bubbleClassNameList"
        @resendMessage="resendMessage(messageModel)"
      >
        <!-- web message-bubble is a named slot, content area slotName is messageElement -->
        <template #messageElement>
          <slot
            v-if="!isUniFrameWork"
            name="messageBubble"
          />
        </template>
        <!-- uni-app message-bubble is an anonymous slot, no slotName -->
        <slot
          v-if="isUniFrameWork"
          name="messageBubble"
        />
      </MessageBubble>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from '../../adapter-vue';
import { TUIStore, IMessageModel } from '@tencentcloud/chat-uikit-engine';
import MessageBubble from '../../components/TUIChat/message-list/message-elements/message-bubble.vue';
import { isUniFrameWork } from '../../utils/env';

interface IProps {
  message: IMessageModel;
  showStyle: string;
  bubbleClassNameList?: string[];
  blinkMessageIDList?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
  showStyle: '',
  bubbleClassNameList: () => [] as string[],
  blinkMessageIDList: () => [] as string[],
});

const emits = defineEmits(['resendMessage', 'handleToggleMessageItem', 'handleH5LongPress']);
const messageModel = computed(() => TUIStore.getMessageModel(props.message?.ID));

// The following is for external interaction such as messageTool, no special processing is required, do not change
const resendMessage = (message: IMessageModel) => {
  emits('resendMessage', message);
};
const handleToggleMessageItem = (e: any, message: IMessageModel, isLongpress = false) => {
  emits('handleToggleMessageItem', e, message, isLongpress);
};
const handleH5LongPress = (e: any, message: IMessageModel, type: string) => {
  emits('handleH5LongPress', e, message, type);
};
</script>

<style lang="scss" scoped>
.message-plugin-tip {
  color: #999;
  font-size: 12px;
  overflow-wrap: anywhere;
  display: flex;
  place-content: center center;
  align-items: center;
  text-align: center;
  margin: 0 10px 10px;
}

.message-tip-highlight {
  animation: highlight 1000ms infinite;

  @keyframes highlight {
    50% {
      color: #ff9c19;
    }
  }

  @keyframes highlight {
    50% {
      color: #ff9c19;
    }
  }
}

:deep(.message-bubble-room) {
  .message-bubble-main-content {
    .message-body {
      .message-body-main {
        .message-body-content {
          &.content-in,
          &.content-out {
            background-color: transparent;
            border-radius: 0;
            padding: 0;
          }
        }
      }
    }
  }
}
</style>
