<template>
  <div class="message-input-wrapper">
    <div :class="['message-input-container', !isPC && 'message-input-container-h5']">
      <MessageInputEditor
        ref="editor"
        :placeholder="props.placeholder"
        :isMuted="props.isMuted"
        :muteText="props.muteText"
        :enableInput="props.enableInput"
        :enableAt="props.enableAt"
        :enableTyping="props.enableTyping"
        :enableDragUpload="props.enableDragUpload"
        @sendMessage="sendMessage"
        @onTyping="onTyping"
        @onAt="onAt"
      />
      <MessageInputButton
        v-if="!props.isMuted"
        @sendMessage="sendMessage"
      />
      <MessageInputAt
        v-if="props.enableAt"
        ref="messageInputAtRef"
        @insertAt="insertAt"
        @onAtListOpen="onAtListOpen"
      />
    </div>
    <MessageInputQuote />
  </div>
</template>

<script setup lang="ts">
import {
  TUIStore,
  StoreName,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { ref } from '../../../adapter-vue';
import MessageInputEditor from './message-input-editor.vue';
import MessageInputAt from './message-input-at/index.vue';
import MessageInputButton from './message-input-button.vue';
import MessageInputQuote from './message-input-quote/index.vue';
import { sendMessages, sendTyping } from '../utils/sendMessage';
import { transformTextWithEmojiNamesToKeys } from '../emoji-config';
import { isPC, isH5 } from '../../../utils/env';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'this is placeholder',
  },
  isMuted: {
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
});

const emit = defineEmits(['sendMessage', 'resetReplyOrReference', 'onTyping']);
const editor = ref<InstanceType<typeof MessageInputEditor>>();
const messageInputAtRef = ref<InstanceType<typeof MessageInputAt>>();
const currentConversation = ref<IConversationModel>();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const onTyping = (inputContentEmpty: boolean, inputBlur: boolean) => {
  sendTyping(inputContentEmpty, inputBlur);
};

const onAt = (show: boolean) => {
  messageInputAtRef.value?.toggleAtList(show);
};

const sendMessage = async () => {
  const _editorContentList = editor.value?.getEditorContent();
  if (!_editorContentList || !currentConversation.value) return;
  const editorContentList = _editorContentList.map((editor: any) => {
    if (editor.type === 'text') {
      editor.payload.text = transformTextWithEmojiNamesToKeys(editor.payload.text);
    }
    return editor;
  });
  await sendMessages(
    editorContentList,
    currentConversation.value,
  );
  emit('sendMessage');
  editor.value?.resetEditor();
};

const insertEmoji = (emoji: any) => {
  editor.value?.addEmoji(emoji);
};

const onAtListOpen = () => {
  if (isH5) {
    editor.value?.blur();
  }
};

const insertAt = (atInfo: any) => {
  editor?.value?.insertAt && editor?.value?.insertAt(atInfo);
};

const reEdit = (content: any) => {
  editor.value?.resetEditor();
  editor.value?.setEditorContent(content);
};

defineExpose({
  insertEmoji,
  reEdit,
});
</script>

<style scoped lang="scss">
@import "../../../assets/styles/common";

.message-input-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.message-input-container {
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  border: none;
  overflow: hidden;
}

.message-input-container-h5 {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
}
</style>
