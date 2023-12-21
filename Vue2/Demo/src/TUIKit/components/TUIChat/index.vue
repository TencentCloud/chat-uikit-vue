<template>
  <div class="chat">
    <div :class="['TUI-chat', !isPC && 'TUI-chat-h5']">
      <div
        v-if="!currentConversationID"
        :class="['TUI-chat-default', !isPC && 'TUI-chat-h5-default']"
      >
        <slot></slot>
      </div>
      <div v-if="currentConversationID" :class="['TUI-chat', !isPC && 'TUI-chat-h5']">
        <ChatHeader
          :class="[
            'TUI-chat-header',
            !isPC && 'TUI-chat-H5-header',
            isUniFrameWork && 'TUI-chat-uniapp-header',
          ]"
          @closeChat="closeChat"
        ></ChatHeader>
        <Forward></Forward>
        <MessageList
          :class="['TUI-chat-message-list', !isPC && 'TUI-chat-h5-message-list']"
          :isGroup="isGroup"
          :groupID="groupID"
          @handleEditor="handleEditor"
        >
        </MessageList>
        <!-- 兼容 uni 打包支付宝小程序 v-show 无效问题 -->
        <MessageInputToolbar
          v-if="isToolbarShow"
          :class="['TUI-chat-message-input-toolbar', !isPC && 'TUI-chat-h5-message-input-toolbar']"
          @insertEmoji="insertEmoji"
        ></MessageInputToolbar>
        <MessageInput
          :class="[
            'TUI-chat-message-input',
            !isPC && 'TUI-chat-h5-message-input',
            isUniFrameWork && 'TUI-chat-uni-message-input',
            isWeChat && 'TUI-chat-wx-message-input',
          ]"
          ref="messageInputRef"
          :isMuted="false"
          :muteText="TUITranslateService.t('TUIChat.您已被管理员禁言')"
          :placeholder="TUITranslateService.t('TUIChat.请输入消息')"
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
  TUITranslateService,
  TUIConversationService,
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
} from "@tencentcloud/chat-uikit-engine";
import TUICore, { TUIConstants, ExtensionInfo } from "@tencentcloud/tui-core";
import { ref, onUnmounted } from "../../adapter-vue";
import ChatHeader from "./chat-header/index.vue";
import MessageList from "./message-list/index.vue";
import MessageInput from "./message-input/index.vue";
import Forward from "./forward/index.vue";
import MessageInputToolbar from "./message-input-toolbar/index.vue";
import { isPC, isWeChat, isUniFrameWork } from "../../utils/env";
import TUIChatConfig from "./config";

const emits = defineEmits(["closeChat"]);
const isToolbarShow = ref<boolean>(!isUniFrameWork);
const messageInputRef = ref();
const currentConversationID = ref();
// 是否显示群组管理
const isGroup = ref(false);
const groupID = ref("");
const groupManageExt = ref<ExtensionInfo>(undefined);

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    if (currentConversationID.value === conversation?.conversationID) {
      return;
    }
    // TUIChat 每次切换会话，需要初始化 chatType;
    TUIChatConfig.setChatType(conversation?.type);
    // 由 TUICustomerServicePlugin 插件判断如果当前会话是客服会话，则设置 chatType 并激活会话。
    TUICore.callService({
      serviceName: TUIConstants.TUICustomerServicePlugin.SERVICE.NAME,
      method: TUIConstants.TUICustomerServicePlugin.SERVICE.METHOD.ACTIVE_CONVERSATION,
      params: { conversationID: conversation?.conversationID },
    });
    currentConversationID.value = conversation?.conversationID;
    isGroup.value = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
    if (isUniFrameWork && isGroup.value && groupID.value !== conversation?.groupProfile?.groupID) {
      const extList = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, {
        filterManageGroup: !isGroup.value,
      });
      groupManageExt.value = extList[0];
    }
    if (isUniFrameWork && !isGroup.value) {
      groupManageExt.value = [];
    }
    groupID.value = conversation?.groupProfile?.groupID;
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
    isToolbarShow.value = (show === undefined) ? !isToolbarShow.value : show;
  } else {
    isToolbarShow.value = true;
  }
};

const handleEditor = (message: IMessageModel, type: string) => {
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
