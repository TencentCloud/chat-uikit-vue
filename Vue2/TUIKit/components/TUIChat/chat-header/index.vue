<template>
  <div :class="['chat-header', !isPC && 'chat-header-h5']">
    <div
      v-if="!isPC && isNotRoomChat"
      :class="['chat-header-back', !isPC && 'chat-header-h5-back']"
      @click="closeChat(currentConversation.conversationID)"
    >
      <Icon :file="backSVG" />
    </div>
    <div class="chat-header-container">
      <div
        v-if="isNotRoomChat"
        :class="['chat-header-content', !isPC && 'chat-header-h5-content']"
      >
        {{ currentConversationName }}
      </div>
      <div>
        <!-- <JoinGroupCard v-if="isPC" /> -->
      </div>
    </div>
    <div :class="['chat-header-setting', !isPC && 'chat-header-h5-setting']">
      <div
        v-for="(item, index) in props.headerExtensionList"
        :key="index"
        @click.stop="handleExtensions(item)"
      >
        <Icon :file="item.icon" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, withDefaults } from '../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  TUITranslateService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { TUIConstants, ExtensionInfo } from '@tencentcloud/tui-core';
// import { JoinGroupCard } from '@tencentcloud/call-uikit-vue';
import Icon from '../../common/Icon.vue';
import backSVG from '../../../assets/icon/back.svg';
import { isPC } from '../../../utils/env';
import TUIChatConfig from '../config';

const props = withDefaults(
  defineProps<{
    headerExtensionList: ExtensionInfo[];
  }>(),
  {
    headerExtensionList: () => ([]),
  },
);

const emits = defineEmits(['closeChat']);
const currentConversation = ref<IConversationModel>();
const currentConversationName = ref('');
const typingStatus = ref(false);
const groupID = ref('');
const isNotRoomChat = ref<boolean>(TUIChatConfig.getChatType() !== TUIConstants.TUIChat.TYPE.ROOM);

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdated,
  });

  TUIStore.watch(StoreName.CHAT, {
    typingStatus: onTypingStatusUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdated,
  });

  TUIStore.unwatch(StoreName.CHAT, {
    typingStatus: onTypingStatusUpdated,
  });
});

const closeChat = (conversationID: string | undefined) => {
  emits('closeChat', conversationID);
};

const handleExtensions = (item: ExtensionInfo) => {
  item.listener.onClicked?.({ groupID: groupID.value });
};

function onCurrentConversationUpdated(conversation: IConversationModel) {
  currentConversation.value = conversation;
  groupID.value = currentConversation.value?.groupProfile?.groupID;
  currentConversationName.value = currentConversation?.value?.getShowName();
}

function onTypingStatusUpdated(status: boolean) {
  typingStatus.value = status;
  if (typingStatus.value) {
    currentConversationName.value = TUITranslateService.t('TUIChat.对方正在输入');
  } else {
    currentConversationName.value = currentConversation.value?.getShowName() || '';
  }
}

</script>
<style lang="scss" scoped>
.chat-header {
  display: flex;
  min-width: 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  &-container {
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: flex-start;
  }

  &-content {
    margin-right: 20px;
    flex: 1;
    font-size: 16px;
    line-height: 30px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    color: #000;
    letter-spacing: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-back,
  &-setting {
    width: 27px;
    height: 27px;

    .icon {
      width: 100%;
      height: 100%;
    }
  }
}

.chat-header-h5 {
  &-back {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &-content{
    margin: 0 20px;
    text-align: center;
  }
}
</style>
