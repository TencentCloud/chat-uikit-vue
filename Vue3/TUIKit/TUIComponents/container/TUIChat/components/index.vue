<template>
  <div class="message-item">
    <MessageTip v-if="isMessageTip(message)" :data="handleTipMessageShowContext(message)" />
    <MessageBubble
      v-else-if="!message.isRevoked"
      :data="message"
      :isH5="env.isH5"
      :messagesList="messageList"
      :needGroupReceipt="displayGroupMessageReadReceipt"
      :needReplies="true"
      :needEmojiReact="displayEmojiReactions"
      @jumpID="jumpID"
      @resendMessage="resendMessage"
      @showReadReceiptDialog="showReadReceiptDialog"
      @showRepliesDialog="showRepliesDialog"
    >
      <MessageText v-if="message.type === types.MSG_TEXT" :data="handleTextMessageShowContext(message)" />
      <MessageImage
        v-if="message.type === types.MSG_IMAGE"
        :isH5="env.isH5"
        :data="handleImageMessageShowContext(message)"
        @uploading="uploading"
        @previewImage="previewImage"
      />
      <MessageVideo
        v-if="message.type === types.MSG_VIDEO"
        :isH5="env.isH5"
        :data="handleVideoMessageShowContext(message)"
        @uploading="uploading"
      />
      <MessageAudio v-if="message.type === types.MSG_AUDIO" :data="handleAudioMessageShowContext(message)" />
      <MessageFile v-if="message.type === types.MSG_FILE" :data="handleFileMessageShowContext(message)" />
      <MessageFace v-if="message.type === types.MSG_FACE" :data="handleFaceMessageShowContext(message)" :isH5="env.isH5"/>
      <MessageLocation v-if="message.type === types.MSG_LOCATION" :data="handleLocationMessageShowContext(message)" />
      <MessageCustom v-if="message.type === types.MSG_CUSTOM" :data="handleCustomMessageShowContext(message)" />
      <MessageMerger v-if="message.type === types.MSG_MERGER" :data="handleMergerMessageShowContext(message)" />
      <template #dialog>
        <MessageTool :message="message" :needEmojiReact="displayEmojiReactions" @handleMessage="handleMessage" />
        <MessageEmojiReact v-if="!env?.isH5 && displayEmojiReactions" :message="message" type="dropdown" />
      </template>
    </MessageBubble>
    <MessageRevoked v-else :isEdit="message.type === types.MSG_TEXT" :data="message" @edit="handleEdit(message)" />
  </div>
</template>

<script setup lang="ts">
import { toRefs, defineProps, defineEmits } from 'vue';
import MessageBubble from './message-bubble.vue';
import MessageText from './message-text.vue';
import MessageImage from './message-image.vue';
import MessageVideo from './message-video.vue';
import MessageAudio from './message-audio.vue';
import MessageFile from './message-file.vue';
import MessageFace from './message-face.vue';
import MessageLocation from './message-location.vue';
import MessageMerger from './message-merger.vue';
import MessageCustom from './message-custom.vue';
import MessageTip from './message-tip.vue';
import MessageTool from './message-tool.vue';
import MessageEmojiReact from './message-emoji-react.vue';
import MessageRevoked from './message-revoked.vue';

import {
  handleTextMessageShowContext,
  handleImageMessageShowContext,
  handleVideoMessageShowContext,
  handleAudioMessageShowContext,
  handleFileMessageShowContext,
  handleFaceMessageShowContext,
  handleLocationMessageShowContext,
  handleMergerMessageShowContext,
  handleTipMessageShowContext,
  handleCustomMessageShowContext,
  isMessageTip,
} from '../utils/utils';
import { Message } from '@tencentcloud/chat';
import constant from '../../constant';

const props = defineProps({
  message: {
    type: Object,
    default: () => ({}),
  },
  beforeMessage: {
    type: Object,
    default: () => ({}),
  },
  types: {
    type: Object,
    default: () => ({}),
  },
  env: {
    type: Object,
    default: () => ({}),
  },
  messageList: {
    type: Array,
    default: () => [],
  },
  // 开关控制位
  displayGroupMessageReadReceipt: {
    type: Boolean,
    default: true,
  },
  displayEmojiReactions: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['handleEditor', 'showDialog', 'uploading', 'jumpID','resendMessage']);
const { message, types, env, messageList, displayGroupMessageReadReceipt, displayEmojiReactions } = toRefs(props);

const handleEdit = (message: any) => {
  emits('handleEditor', message, 'reedit');
};

const handleMessage = (message: Message, type: string) => {
  if (!message || !type) {
    return;
  }
  switch (type) {
    case constant.handleMessage.forward:
      emits('showDialog', message, constant.handleMessage.forward);
      break;
    case constant.handleMessage.reference:
      emits('handleEditor', message, constant.handleMessage.reference);
      break;
    case constant.handleMessage.reply:
      emits('handleEditor', message, constant.handleMessage.reply);
      break;
    default:
      break;
  }
};

const previewImage = (message: Message) => {
  if (message) {
    emits('showDialog', message, 'previewImage');
  }
};

const showReadReceiptDialog = (message: Message) => {
  if (message) {
    emits('showDialog', message, 'receipt');
  }
};

const showRepliesDialog = (message: Message) => {
  if (message) {
    emits('showDialog', message, 'replies');
  }
};

const jumpID = (messageID: string) => {
  if (messageID) {
    emits('jumpID', messageID);
  }
};

const uploading = () => {
  emits('uploading');
};

const resendMessage = (message: Message) => {
  if (message) {
    emits('resendMessage', message);
  }
}
</script>
<style lang="scss" scoped>
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');
.message-item {
  display: flex;
  flex-direction: column;
}
</style>
