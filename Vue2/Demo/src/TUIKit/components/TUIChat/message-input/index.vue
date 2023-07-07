<template>
  <div :class="['message-input', !isPC && 'message-input-h5']">
    <MessageInputEditor
      class="message-input-editor"
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
      class="message-input-button"
      v-if="!props.isMuted"
      @sendMessage="sendMessage"
    ></MessageInputButton>
    <MessageInputAt v-if="props.enableAt" @onAtListOpen="onAtListOpen"></MessageInputAt>
  </div>
</template>
<script setup lang="ts">
import {
  TUIGlobal,
  TUIStore,
  StoreName,
  TUIChatService,
  SendMessageParams,
  IConversationModel,
} from "@tencentcloud/chat-uikit-engine";
import {
  defineProps,
  defineEmits,
  toRefs,
  ref,
  defineExpose,
  watch,
} from "../../../adapter-vue";
import MessageInputEditor from "./message-input-editor.vue";
import MessageInputAt from "./message-input-at/index.vue";
import MessageInputButton from "./message-input-button.vue";
import { sendMessages, sendTyping } from "../utils/sendMessage";

const props = defineProps({
  placeholder: {
    type: String,
    default: "this is placeholder",
  },
  replyOrReference: {
    type: Object,
    default: () => ({}),
    required: false,
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
const replyOrReference = ref();
const editor = ref();
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

const resetReplyOrReference = () => {
  // todo
};

const sendMessage = async () => {
  const messageList =
    editor?.value?.getEditorContent && editor?.value?.getEditorContent();
  await sendMessages(
    messageList,
    currentConversation.value,
    replyOrReference.value
  );
  emit("sendMessage");
  editor?.value?.resetEditor && editor?.value?.resetEditor();
  resetReplyOrReference();
};

const insertEmoji = (emoji: any) => {
  editor?.value?.addEmoji(emoji);
};

const onAtListOpen = () => {
  if(isH5.value){
    editor?.value?.blur();
  }
};

const reEdit = (content: any) => {
  editor?.value?.resetEditor();
  resetReplyOrReference();
  editor?.value?.setEditorContent(content);
};

defineExpose({
  insertEmoji,
  reEdit,
});
</script>

<style scoped lang="scss">
@import url("../../../assets/styles/common.scss");
.message-input {
  position: relative;
  display: flex;
  flex-direction: column;
  border: none;
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
  &-editor {
    flex: 1;
    display: flex;
  }
  &-button {
    width: fit-content;
  }
}
.message-input-h5 {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
}
</style>
