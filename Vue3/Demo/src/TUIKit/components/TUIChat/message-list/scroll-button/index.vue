<template>
  <div
    v-if="isScrollButtonVisible"
    class="scroll-button"
    @click="scrollToMessageListBottom"
  >
    <Icon
      width="10px"
      height="10px"
      :file="doubleArrowIcon"
    />
    <div class="scroll-button-text">
      {{ scrollButtonContent }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from '../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import Icon from '../../../common/Icon.vue';
import doubleArrowIcon from '../../../../assets/icon/double-arrow.svg';
import { getBoundingClientRect } from '@tencentcloud/universal-api';
import { JSONToObject } from '../../../../utils';

interface IEmits {
  (key: 'scrollToLatestMessage'): void;
}
const emits = defineEmits<IEmits>();

const messageList = ref<IMessageModel[]>([]);
const currentConversationID = ref<string>('');
const currentLastMessageTime = ref<number>(0);
const newMessageCount = ref<number>(0);
const isScrollOverOneScreen = ref<boolean>(false);
const isExistLastMessage = ref<boolean>(false);
const isScrollButtonVisible = ref<boolean>(false);
const scrollButtonContent = computed(() =>
  newMessageCount.value ? `${newMessageCount.value}${TUITranslateService.t('TUIChat.条新消息')}` : TUITranslateService.t('TUIChat.回到最新位置'),
);

watch(() => [isScrollOverOneScreen.value, isExistLastMessage.value],
  () => {
    isScrollButtonVisible.value = isScrollOverOneScreen.value || isExistLastMessage.value;
    if (!isScrollButtonVisible.value) {
      resetNewMessageCount();
    }
  },
  { immediate: true },
);

onMounted(() => {
  TUIStore.watch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    newMessageList: onNewMessageListUpdated,
  });
  TUIStore.watch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    newMessageList: onNewMessageListUpdated,
  });
  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdated,
  });
});

function isTypingMessage(message: IMessageModel): boolean {
  return JSONToObject(message.payload?.data)?.businessID === 'user_typing_status';
}

function onMessageListUpdated(newMessageList: IMessageModel[]) {
  messageList.value = newMessageList || [];
  const lastMessage = messageList.value?.[messageList.value?.length - 1];
  isExistLastMessage.value = !!(
    lastMessage && lastMessage?.time < currentLastMessageTime?.value
  );
}

function onNewMessageListUpdated(newMessageList: IMessageModel[]) {
  if (Array.isArray(newMessageList) && isScrollButtonVisible.value) {
    newMessageList.forEach((message: IMessageModel) => {
      if (message && message.conversationID === currentConversationID.value && !message.isDeleted && !message.isRevoked && !isTypingMessage(message)) {
        newMessageCount.value += 1;
      }
    });
  }
}

function onCurrentConversationUpdated(conversation: IConversationModel | undefined) {
  if (conversation?.conversationID !== currentConversationID.value) {
    resetNewMessageCount();
  }
  currentConversationID.value = conversation?.conversationID || '';
  currentLastMessageTime.value = conversation?.lastMessage?.lastTime || 0;
}

// When the scroll height of the message list upwards is greater than one screen, show scrolling to the latest tips.
async function judgeScrollOverOneScreen(e: Event) {
  if (e.target) {
    try {
      const { height } = await getBoundingClientRect(`#${(e.target as HTMLElement)?.id}`, 'messageList') || {};
      const scrollHeight = (e.target as HTMLElement)?.scrollHeight || (e.detail as HTMLElement)?.scrollHeight;
      const scrollTop = (e.target as HTMLElement)?.scrollTop || (e.detail as HTMLElement)?.scrollTop || 0;
      // while scroll over one screen show this scroll button.
      if (scrollHeight - scrollTop > 2 * height) {
        isScrollOverOneScreen.value = true;
        return;
      }
      isScrollOverOneScreen.value = false;
    } catch (error) {
      isScrollOverOneScreen.value = false;
    }
  }
}

// reset messageSource
function resetMessageSource() {
  if (TUIStore.getData(StoreName.CHAT, 'messageSource') !== undefined) {
    TUIStore.update(StoreName.CHAT, 'messageSource', undefined);
  }
}

// reset newMessageCount
function resetNewMessageCount() {
  newMessageCount.value = 0;
}

function scrollToMessageListBottom() {
  resetMessageSource();
  resetNewMessageCount();
  emits('scrollToLatestMessage');
}

defineExpose({
  judgeScrollOverOneScreen,
  isScrollButtonVisible,
});
</script>

<style scoped lang="scss">
.scroll-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 92px;
  height: 28px;
  background: #fff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &-text {
    font-family: PingFangSC-Regular, system-ui;
    font-size: 10px;
    color: #147aff;
    margin-left: 3px;
  }
}
</style>
