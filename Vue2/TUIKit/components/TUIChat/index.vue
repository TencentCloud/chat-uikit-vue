<template>
  <div class="chat">
    <div :class="['TUI-chat', !isPC && 'TUI-chat-h5']">
      <div
        v-if="!currentConversationID"
        :class="['TUI-chat-default', !isPC && 'TUI-chat-h5-default']"
      >
        <slot></slot>
      </div>
      <div
        v-if="currentConversationID"
        :class="['TUI-chat', !isPC && 'TUI-chat-h5']"
      >
        <ChatHeader
          :class="[
            'TUI-chat-header',
            !isPC && 'TUI-chat-H5-header',
            isUniFrameWork && 'TUI-chat-uniapp-header',
          ]"
          @closeChat="closeChat"
        ></ChatHeader>
        <MessageList
          :class="[
            'TUI-chat-message-list',
            !isPC && 'TUI-chat-h5-message-list',
          ]"
          :isGroup="isGroup"
          :groupID="groupID"
          @handleEditor="handleEditor"
        >
        </MessageList>
        <MessageInputToolbar
          v-show="isToolbarShow"
          :class="[
            'TUI-chat-message-input-toolbar',
            !isPC && 'TUI-chat-h5-message-input-toolbar',
          ]"
          @insertEmoji="insertEmoji"
        ></MessageInputToolbar>
        <MessageInput
          :class="[
            'TUI-chat-message-input',
            !isPC && 'TUI-chat-h5-message-input',
            isUniFrameWork && 'TUI-chat-uni-message-input',
            isWeChat && 'TUI-chat-wx-message-input',
          ]"
          :isMuted="false"
          :muteText="TUITranslateService.t('TUIChat.您已被管理员禁言')"
          :placeholder="TUITranslateService.t('请输入消息')"
          ref="messageInputRef"
          @handleToolbarListShow="handleToolbarListShow"
        ></MessageInput>
      </div>
      <!-- 群组管理 -->
      <div
        class="group-profile"
        v-if="isUniFrameWork && isGroup && groupManageExt"
        @click="handleGroup"
      >
        {{ groupManageExt.text }}
        <!-- 更多 -->
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIGlobal,
  TUITranslateService,
  TUIConversationService,
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
} from "@tencentcloud/chat-uikit-engine";
import { ref, onUnmounted } from "../../adapter-vue";
import ChatHeader from "./chat-header/index.vue";
import MessageList from "./message-list/index.vue";
import MessageInput from "./message-input/index.vue";
import MessageInputToolbar from "./message-input-toolbar/index.vue";
import TUICore, { TUIConstants, ExtensionInfo } from "@tencentcloud/tui-core";
import { isUniFrameWork } from "../../utils/is-uni";

const emits = defineEmits(["closeChat"]);
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");
const isToolbarShow = ref<boolean>(!isUniFrameWork);
const messageInputRef = ref();
const currentConversationID = ref();
// 是否显示群组管理
const isGroup = ref(false);
const groupID = ref("");
const groupManageExt = ref<typeof ExtensionInfo>(undefined);

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    currentConversationID.value = id;
  },
  currentConversation: (conversation: typeof IConversationModel) => {
    isGroup.value = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
    groupID.value = conversation?.groupProfile?.groupID;
    const extList = TUICore.getExtensionList(
      TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID,
      { filterManageGroup: isGroup.value }
    );
    groupManageExt.value = extList[0];
  },
});

onUnmounted(() => {
  reset();
});

// 清空当前 conversationID
const reset = () => {
  TUIConversationService.switchConversation();
};

const closeChat = (conversationID: string) => {
  emits("closeChat", conversationID);
  reset();
};

const insertEmoji = (emojiObj: object) => {
  messageInputRef?.value?.insertEmoji(emojiObj);
};

const handleToolbarListShow = (show?: boolean) => {
  if (isUniFrameWork) {
    isToolbarShow.value = show ?? !isToolbarShow.value;
  } else {
    isToolbarShow.value = true;
  }
};

const handleEditor = (message: typeof IMessageModel, type: string) => {
  if (!message || !type) return;
  switch (type) {
    case "reference":
      // todo
      break;
    case "reply":
      // todo
      break;
    case "reedit":
      if (message?.payload?.text) {
        messageInputRef?.value?.reEdit(message?.payload?.text);
      }
      break;
    default:
      break;
  }
};

const handleGroup = () => {
  groupManageExt.value.listener.onClicked({ groupID: groupID.value });
};
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
