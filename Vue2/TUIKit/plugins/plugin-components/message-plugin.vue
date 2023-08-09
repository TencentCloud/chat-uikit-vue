<template>
  <!-- 以下为以messageTip形式展示 -->
  <div v-if="showStyle === 'tip'" class="message-plugin-tip">
    <MessageCallGroup
      :message="messageModel"
      :signalingInfo="messageSignalingInfo"
      :customContent="messageCustomContent"
    ></MessageCallGroup>
  </div>
  <!-- 以下为以messageBubble形式展示 -->
  <div
    v-else-if="showStyle === 'bubble'"
    class="message-plugin-bubble-content"
    @longpress="handleToggleMessageItem($event, messageModel, true)"
    @click.prevent.right="handleToggleMessageItem($event, messageModel)"
    @touchstart="handleH5LongPress($event, messageModel, 'touchstart')"
    @touchend="handleH5LongPress($event, messageModel, 'touchend')"
    @mouseover="handleH5LongPress($event, messageModel, 'touchend')"
  >
    <messageBubble
      :messageItem="messageModel"
      @resendMessage="resendMessage(messageModel)"
    >
      <MessageCallC2C
        :message="messageModel"
        :signalingInfo="messageSignalingInfo"
        :customContent="messageCustomContent"
      ></MessageCallC2C>
    </messageBubble>
  </div>
</template>

<script lang="ts" setup>
import { TUIStore } from "@tencentcloud/chat-uikit-engine";
import TUIChatEngine, { IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { computed } from "../../adapter-vue";
import messageBubble from "../../components/TUIChat/message-list/message-elements/message-bubble.vue";
import MessageCallGroup from "./message-call/message-call-group.vue";
import MessageCallC2C from "./message-call/message-call-c2c.vue";
const props = defineProps({
  message: {
    type: Object,
    default: () => ({}),
  },
});
const emits = defineEmits([
  "resendMessage",
  "handleToggleMessageItem",
  "handleH5LongPress",
]);
const messageModel = computed(() =>
  TUIStore.getMessageModel(props.message?.ID)
);
const messageSignalingInfo = computed(() =>
  messageModel?.value?.getSignalingInfo()
);
const messageCustomContent = computed(() =>
  messageModel?.value?.getMessageContent()
);
// 需要展示ui的判断逻辑
const showStyle = computed(() => {
  if (messageSignalingInfo?.value?.businessID === 1) {
    if (messageModel.value?.conversationType === TUIChatEngine.TYPES.CONV_C2C) {
      return "bubble";
    }
    if (
      messageModel.value?.conversationType === TUIChatEngine.TYPES.CONV_GROUP
    ) {
      return "tip";
    }
  }
  return "";
});

// 以下为messageTool等外部交互使用，无需特殊处理，勿动
const resendMessage = (message: typeof IMessageModel) => {
  emits("resendMessage", message);
};
const handleToggleMessageItem = (
  e: any,
  message: typeof IMessageModel,
  isLongpress = false
) => {
  emits("handleToggleMessageItem", e, message, isLongpress);
};
const handleH5LongPress = (
  e: any,
  message: typeof IMessageModel,
  type: string
) => {
  emits("handleH5LongPress", e, message, type);
};
</script>
<style lang="scss" scoped>
.message-plugin-tip {
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
