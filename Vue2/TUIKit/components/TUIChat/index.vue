<template>
  <div class="chat">
    <div :class="['tui-chat', !isPC && 'tui-chat-h5']">
      <div
        v-if="!currentConversationID"
        :class="['tui-chat-default', !isPC && 'tui-chat-h5-default']"
      >
        <slot />
      </div>
      <div
        v-if="currentConversationID"
        :class="['tui-chat', !isPC && 'tui-chat-h5']"
      >
        <ChatHeader
          :class="[
            'tui-chat-header',
            !isPC && 'tui-chat-H5-header',
            isUniFrameWork && 'tui-chat-uniapp-header',
          ]"
          @closeChat="closeChat"
        />
        <Forward @toggleMultipleSelectMode="toggleMultipleSelectMode" />
        <MessageList
          ref="messageListRef"
          :class="['tui-chat-message-list', !isPC && 'tui-chat-h5-message-list']"
          :isGroup="isGroup"
          :groupID="groupID"
          :isMultipleSelectMode="isMultipleSelectMode"
          @handleEditor="handleEditor"
          @closeInputToolBar="() => changeToolbarDisplayType('none')"
          @toggleMultipleSelectMode="toggleMultipleSelectMode"
        />
        <MultipleSelectPanel
          v-if="isMultipleSelectMode"
          @oneByOneForwardMessage="oneByOneForwardMessage"
          @mergeForwardMessage="mergeForwardMessage"
          @toggleMultipleSelectMode="toggleMultipleSelectMode"
        />
        <template v-else>
          <MessageInputToolbar
            v-if="isInputToolbarShow"
            :class="[
              'tui-chat-message-input-toolbar',
              !isPC && 'tui-chat-h5-message-input-toolbar',
              isUniFrameWork && 'tui-chat-uni-message-input-toolbar'
            ]"
            :displayType="inputToolbarDisplayType"
            @insertEmoji="insertEmoji"
            @changeToolbarDisplayType="changeToolbarDisplayType"
            @scrollToLatestMessage="scrollToLatestMessage"
          />
          <MessageInput
            ref="messageInputRef"
            :class="[
              'tui-chat-message-input',
              !isPC && 'tui-chat-h5-message-input',
              isUniFrameWork && 'tui-chat-uni-message-input',
              isWeChat && 'tui-chat-wx-message-input',
            ]"
            :isMuted="false"
            :muteText="TUITranslateService.t('TUIChat.您已被管理员禁言')"
            :placeholder="TUITranslateService.t('TUIChat.请输入消息')"
            :inputToolbarDisplayType="inputToolbarDisplayType"
            @changeToolbarDisplayType="changeToolbarDisplayType"
          />
        </template>
      </div>
      <!-- Group Management -->
      <div
        v-if="isUniFrameWork && isGroup && groupManageExt"
        class="group-profile"
        @click="handleGroup"
      >
        {{ groupManageExt.text }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from '../../adapter-vue';
import TUIChatEngine, {
  TUITranslateService,
  TUIConversationService,
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import TUICore, { TUIConstants, ExtensionInfo } from '@tencentcloud/tui-core';
import ChatHeader from './chat-header/index.vue';
import MessageList from './message-list/index.vue';
import MessageInput from './message-input/index.vue';
import MultipleSelectPanel from './mulitple-select-panel/index.vue';
import Forward from './forward/index.vue';
import MessageInputToolbar from './message-input-toolbar/index.vue';
import { isPC, isWeChat, isUniFrameWork } from '../../utils/env';
import { ToolbarDisplayType } from '../../interface';
import TUIChatConfig from './config';

const emits = defineEmits(['closeChat']);

const groupID = ref('');
const isGroup = ref(false);
const currentConversationID = ref();
const isMultipleSelectMode = ref(false);
const inputToolbarDisplayType = ref<ToolbarDisplayType>('none');
const messageInputRef = ref();
const messageListRef = ref<InstanceType<typeof MessageList>>();
const groupManageExt = ref<ExtensionInfo | undefined>(undefined);

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdate,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdate,
  });
  reset();
});

const isInputToolbarShow = computed<boolean>(() => {
  return isUniFrameWork ? inputToolbarDisplayType.value !== 'none' : true;
});

const reset = () => {
  TUIConversationService.switchConversation('');
};

const closeChat = (conversationID: string) => {
  emits('closeChat', conversationID);
  reset();
};

const insertEmoji = (emojiObj: object) => {
  messageInputRef.value?.insertEmoji(emojiObj);
};

const handleEditor = (message: IMessageModel, type: string) => {
  if (!message || !type) return;
  switch (type) {
    case 'reference':
      // todo
      break;
    case 'reply':
      // todo
      break;
    case 'reedit':
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

function changeToolbarDisplayType(type: ToolbarDisplayType) {
  inputToolbarDisplayType.value = inputToolbarDisplayType.value === type ? 'none' : type;
  if (inputToolbarDisplayType.value !== 'none' && isUniFrameWork) {
    uni.$emit('scroll-to-bottom');
  }
}

function scrollToLatestMessage() {
  messageListRef.value?.scrollToLatestMessage();
}

function toggleMultipleSelectMode(visible?: boolean) {
  isMultipleSelectMode.value = visible === undefined ? !isMultipleSelectMode.value : visible;
}

function mergeForwardMessage() {
  messageListRef.value?.mergeForwardMessage();
}

function oneByOneForwardMessage() {
  messageListRef.value?.oneByOneForwardMessage();
}

function onCurrentConversationUpdate(conversation: IConversationModel) {
  if (currentConversationID.value === conversation?.conversationID) {
    return;
  }
  isMultipleSelectMode.value = false;
  // Each time you switch conversations in TUIChat, you need to initialize chatType
  TUIChatConfig.setChatType(conversation?.type);
  // The TUICustomerServicePlugin plugin determines if the current conversation is a customer service conversation, then sets chatType and activates the conversation.
  TUICore.callService({
    serviceName: TUIConstants.TUICustomerServicePlugin.SERVICE.NAME,
    method: TUIConstants.TUICustomerServicePlugin.SERVICE.METHOD.ACTIVE_CONVERSATION,
    params: { conversationID: conversation?.conversationID },
  });
  currentConversationID.value = conversation?.conversationID;
  isGroup.value = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
  if (TUICore.getService(TUIConstants.TUICalling.SERVICE.NAME)) {
    // while chat converstaion changed, notify callkit current conversation type, c2c or group
    TUICore.notifyEvent(
      TUIConstants.TUIChat.EVENT.CHAT_STATE_CHANGED,
      TUIConstants.TUIChat.EVENT_SUB_KEY.CHAT_OPENED,
      {
        groupID: conversation?.groupProfile?.groupID,
      },
    );
  }
  if (isUniFrameWork && isGroup.value && groupID.value !== conversation?.groupProfile?.groupID) {
    const extList = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, {
      filterManageGroup: !isGroup.value,
    });
    groupManageExt.value = extList[0];
  }
  if (isUniFrameWork && !isGroup.value) {
    groupManageExt.value = undefined;
  }
  groupID.value = conversation?.groupProfile?.groupID;
}
</script>

<style scoped lang="scss" src="./style/index.scss"></style>
