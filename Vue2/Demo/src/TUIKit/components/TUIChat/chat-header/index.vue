<template>
  <div :class="['chat-header', !isPC && 'chat-header-h5']">
    <div
      v-show="!isPC"
      :class="['chat-header-back', !isPC && 'chat-header-h5-back']"
      @click="closeChat(currentConversation.conversationID)"
    >
      <Icon :file="backSVG" />
    </div>
    <div :class="['chat-header-content', !isPC && 'chat-header-h5-content']">
      {{ currentConversationName }}
    </div>
    <div :class="['chat-header-setting', !isPC && 'chat-header-h5-setting']">
      <div
        v-for="(item, index) in extensions"
        :key="index"
        @click.stop="handleExtensions(item)"
      >
        <Icon :file="item.icon" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import TUICore, { TUIConstants, ExtensionInfo } from '@tencentcloud/tui-core';
import { ref, onMounted, onUnmounted } from '../../../adapter-vue';
import Icon from '../../common/Icon.vue';
import backSVG from '../../../assets/icon/back.svg';
import { isPC } from '../../../utils/env';

const emits = defineEmits(['closeChat']);
const currentConversation = ref<IConversationModel>();
const currentConversationName = ref('');
const typingStatus = ref(false);
const groupID = ref('');
const extensions = ref<ExtensionInfo[]>([]);

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
  const isGroup = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
  if (isGroup && currentConversation.value?.conversationID !== conversation?.conversationID) {
    extensions.value = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, { filterManageGroup: !isGroup });
  }
  if (!isGroup) {
    extensions.value = [];
  }
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  &-content {
    flex: 1;
    font-size: 16px;
    line-height: 30px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    color: #000;
    margin-right: 30%;
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
    margin: 0 20%;
    text-align: center;
  }
}
</style>
