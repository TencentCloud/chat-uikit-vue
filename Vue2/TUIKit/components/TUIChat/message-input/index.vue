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
      ></MessageInputEditor>
      <MessageInputButton
        v-if="!props.isMuted"
        @sendMessage="sendMessage"
      ></MessageInputButton>
      <MessageInputAt
        v-if="props.enableAt"
        @onAtListOpen="onAtListOpen"
      ></MessageInputAt>
    </div>
    <MessageInputQuote />
  </div>
</template>

<script setup lang="ts">
import {
  TUIGlobal,
  TUIStore,
  StoreName,
  IConversationModel
} from "@tencentcloud/chat-uikit-engine";
import { ref } from "../../../adapter-vue";
import MessageInputEditor from "./message-input-editor.vue";
import MessageInputAt from "./message-input-at/index.vue";
import MessageInputButton from "./message-input-button.vue";
import MessageInputQuote from "./message-input-quote/index.vue";
import { sendMessages, sendTyping } from "../utils/sendMessage";

const props = defineProps({
  placeholder: {
    type: String,
    default: "this is placeholder",
  },
  isMuted: {
    type: Boolean,
    default: true,
  },
  muteText: {
    type: String,
    default: "",
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

const emit = defineEmits(["sendMessage", "resetReplyOrReference", "onTyping"]);
const editor = ref<InstanceType<typeof MessageInputEditor>>();
const currentConversation = ref<IConversationModel>();
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isH5 = ref(TUIGlobal.getPlatform() === "h5");

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const onTyping = (inputContentEmpty: boolean, inputBlur: boolean) => {
  sendTyping(inputContentEmpty, inputBlur);
};

const sendMessage = async () => {
  const editorContentList = editor.value?.getEditorContent();
  if (!editorContentList || !currentConversation.value) return;
  await sendMessages(
    editorContentList,
    currentConversation.value
  );
  emit("sendMessage");
  editor.value?.resetEditor();
};

const insertEmoji = (emoji: any) => {
  editor.value?.addEmoji(emoji);
};

const onAtListOpen = () => {
  if (isH5.value) {
    editor.value?.blur();
  }
};

const reEdit = (content: any) => {
  editor.value?.resetEditor();
  // resetReplyOrReference();
  editor.value?.setEditorContent(content);
};

defineExpose({
  insertEmoji,
  reEdit,
});
</script>

<style scoped lang="scss">
@import url("../../../assets/styles/common.scss");

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
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
}
</style>
