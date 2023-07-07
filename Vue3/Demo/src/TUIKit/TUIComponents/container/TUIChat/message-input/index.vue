<template>
  <div :class="['message-input', isH5 && 'message-input-h5']">
    <MessageInputEditor
      ref="editor"
      :isH5="isH5"
      :placeholder="placeholder"
      :isGroup="isGroup"
      :isMute="isMute"
      :muteText="muteText"
      :enableInput="enableInput"
      :enableAt="enableAt"
      :enableTyping="enableTyping"
      :enableDragUpload="enableDragUpload"
      @sendMessage="sendMessage"
      @onTyping="onTyping"
    ></MessageInputEditor>
    <MessageInputButton :isH5="isH5" @sendMessage="sendMessage" v-if="!isMute"></MessageInputButton>
    <MessageInputAt
      :memberList="memberList"
      :isGroup="isGroup"
      :selfInfo="conversation?.groupProfile?.selfInfo"
      :isH5="isH5"
      v-if="enableAt"
    ></MessageInputAt>
    <MessageInputReferenceOrReply
      :replyOrReference="replyOrReference"
      :isH5="isH5"
      @resetReplyOrReference="resetReplyOrReference"
    ></MessageInputReferenceOrReply>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, toRefs, ref, defineExpose, watch } from 'vue';
import MessageInputEditor from './message-input-editor.vue';
import MessageInputAt from './message-input-at.vue';
import MessageInputButton from './message-input-button.vue';
import MessageInputReferenceOrReply from './message-input-reference-or-reply.vue';
import { JSONToObject } from '../utils/utils';
import { handleErrorPrompts } from '../../utils';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'this is placeholder',
  },
  conversation: {
    type: Object,
    default: () => ({}),
  },
  replyOrReference: {
    type: Object,
    default: () => ({}),
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  memberList: {
    type: Array,
    default: () => [],
  },
  isMute: {
    type: Boolean,
    default: true,
  },
  muteText: {
    type: String,
    default: '',
  },
  enableInput: {
    type: Boolean,
    default: true,
  },
  enableAt: {
    type: Boolean,
    default: true,
  },
  enableDragUpload: {
    type: Boolean,
    default: true,
  },
  enableTyping: {
    type: Boolean,
    default: true,
  },
  env: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['sendMessage', 'resetReplyOrReference', 'onTyping']);
const { placeholder, isGroup, memberList, conversation, replyOrReference, env, enableTyping } = toRefs(props);
const editor = ref();
const isH5 = ref(props?.env?.isH5);

watch(
  () => conversation.value,
  (newVal: any, oldVal: any) => {
    if (newVal?.conversationID !== oldVal?.conversationID) {
      // conversation change
      editor?.value?.resetEditor();
    }
  },
  {
    immediate: true,
  }
);

const sendMessage = async () => {
  const TUIServer = (window as any)?.TUIKitTUICore?.TUIServer?.TUIChat;
  const messageList = editor?.value?.getEditorContent();
  const replyOrReferenceObject = replyOrReference.value;
  await messageList?.forEach(async (content: any) => {
    try {
      let cloudCustomData, res;
      // handle message typing
      cloudCustomData = handleMessageWithTyping(cloudCustomData);
      switch (content?.type) {
        case 'text':
          // 引用和回复只支持文本消息（对标微信）
          // replay or reference message
          cloudCustomData = handleMessageReplyOrReference(cloudCustomData);
          // @ text message
          if (content?.payload?.atUserList) {
            res = await TUIServer?.sendTextAtMessage(
              {
                text: JSON.parse(JSON.stringify(content?.payload?.text)),
                atUserList: content?.payload?.atUserList,
              },
              cloudCustomData
            );
          } else {
            res = await TUIServer?.sendTextMessage(JSON.parse(JSON.stringify(content?.payload?.text)), cloudCustomData);
          }
          if (replyOrReferenceObject?.show === 'reply') {
            await TUIServer.replyMessage(res?.data?.message);
          }
          break;
        case 'image':
          await TUIServer?.sendImageMessage(content?.payload?.file);
          break;
        case 'video':
          await TUIServer?.sendVideoMessage(content?.payload?.file);
          break;
        case 'file':
          await TUIServer?.sendFileMessage(content?.payload?.file);
          break;
        default:
          break;
      }
      emit('sendMessage');
    } catch (error: any) {
      handleErrorPrompts(error, env.value);
    }
  });
  editor?.value?.resetEditor();
  resetReplyOrReference();
};

const onTyping = (inputContentEmpty: boolean, inputBlur: boolean) => {
  emit('onTyping', inputContentEmpty, inputBlur);
};

const handleMessageWithTyping = (cloudCustomData: any) => {
  if (enableTyping.value) {
    if (!cloudCustomData) {
      cloudCustomData = {};
    }
    cloudCustomData.messageFeature = {
      needTyping: 1,
      version: 1,
    };
  }
  return cloudCustomData;
};

const handleMessageReplyOrReference = (cloudCustomData: any) => {
  if (replyOrReference?.value?.show !== 'reply' && replyOrReference?.value?.show !== 'reference') {
    return cloudCustomData;
  }
  if (!cloudCustomData) {
    cloudCustomData = {};
  }
  cloudCustomData.messageReply = {
    messageAbstract: replyOrReference?.value?.content,
    messageSender: replyOrReference?.value?.message?.nick || replyOrReference?.value?.message?.from,
    messageID: replyOrReference?.value?.message?.ID,
    messageType: replyOrReference?.value?.type,
    version: 1,
  };
  if (replyOrReference?.value?.show === 'reply') {
    try {
      cloudCustomData.messageReply.messageRootID = replyOrReference?.value?.message?.ID;
      if (replyOrReference?.value?.message?.cloudCustomData) {
        const replyMessageCloudCustomData = JSONToObject(replyOrReference?.value?.message?.cloudCustomData as any);
        cloudCustomData.messageReply.messageRootID =
          replyMessageCloudCustomData?.messageReply?.messageRootID || replyOrReference?.value?.message?.ID;
      }
    } catch (error) {
      console.warn(error);
    }
  }
  return cloudCustomData;
};

const addEmoji = (emoji: any) => {
  editor?.value?.addEmoji(emoji);
};

const resetReplyOrReference = () => {
  emit('resetReplyOrReference');
};

const reEdit = (content: any) => {
  editor?.value?.resetEditor();
  resetReplyOrReference();
  editor?.value?.setEditorContent(content);
};

defineExpose({
  addEmoji,
  reEdit,
});
</script>

<style scoped lang="scss">
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');
.message-input {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  border: none;
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
}
.message-input-h5 {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
