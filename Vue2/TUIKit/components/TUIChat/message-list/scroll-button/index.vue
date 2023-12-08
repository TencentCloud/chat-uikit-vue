<template>
  <div
    v-if="isExistLatestMessage || isScrollOverOneScreen"
    class="scroll-button"
    @click="scrollToMessageListBottom"
  >
    <Icon
      width="10px"
      height="10px"
      :file="doubleArrowIcon"
    />
    <div class="scroll-button-text">
      {{ TUITranslateService.t("TUIChat.回到最新位置") }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "../../../../adapter-vue";
import {
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import doubleArrowIcon from "../../../../assets/icon/double-arrow.svg";

interface IEmits {
  (key: "scrollToLatestMessage"): void;
}
const emits = defineEmits<IEmits>();

const messageList = ref<IMessageModel[]>([]);
const currentLastMessageTime = ref<number>(0);
const isScrollOverOneScreen = ref<boolean>(false);

onMounted(() => {
  TUIStore.watch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
  });

  TUIStore.watch(StoreName.CONV, {
    currentConversation: getLatestMessageTime,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
  });

  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: getLatestMessageTime,
  });
});

// TODO
const isExistLatestMessage = computed((): boolean => {
  const lastSuccessMessageIndex = messageList.value?.findLastIndex(
    (message: IMessageModel) => message.status === "success"
  );
  return (
    lastSuccessMessageIndex &&
    messageList?.value[lastSuccessMessageIndex]?.time < currentLastMessageTime?.value
  );
});

function onMessageListUpdated(newMessageList: IMessageModel[]) {
  messageList.value = newMessageList || [];
}

function getLatestMessageTime(conversation: IConversationModel | undefined) {
  currentLastMessageTime.value = conversation?.lastMessage?.lastTime || 0;
}

// 消息列表向上的滚动高度大于一屏时，展示滚动到最新
function judgeScrollOverOneScreen(e: Event) {
  if (typeof (e.target as HTMLElement)?.scrollTop === "number") {
    const scrollListDom = e.target as HTMLElement;
    const { height } = scrollListDom.getBoundingClientRect() || {};
    const { scrollHeight, scrollTop } = scrollListDom;
    if (height && scrollHeight) {
      if (scrollTop < scrollHeight - 2 * height) {
        isScrollOverOneScreen.value = true;
      } else {
        isScrollOverOneScreen.value = false;
      }
    }
  }
}

// 载入最新的 messageSource
function resetMessageSource() {
  if (TUIStore.getData(StoreName.CHAT, "messageSource") !== undefined) {
    TUIStore.update(StoreName.CHAT, "messageSource", undefined);
  }
}

// 滚动到消息列表最底部
function scrollToMessageListBottom() {
  resetMessageSource();
  setTimeout(() => emits("scrollToLatestMessage"), 100);
}

defineExpose({
  judgeScrollOverOneScreen,
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
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0%);
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
