<template>
  <div
    v-show="isShowReadStatus"
    :class="{
      'message-label': true,
      'unread': isUseUnreadStyle,
      'finger-point': isHoverFingerPointer,
    }"
    @click="openReadUserPanel"
  >
    <span>{{ readStatusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from '../../../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  StoreName,
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';

interface IProps {
  message: IMessageModel;
}

interface IEmits {
  (e: 'openReadUserPanel'): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({}) as IMessageModel,
});

enum ReadState {
  Read,
  Unread,
  AllRead,
  NotShow,
  PartiallyRead,
}

const TYPES = TUIChatEngine.TYPES;
// 用户级别的已读回执开关 优先级最高
const isDisplayMessageReadReceipt = ref<boolean>(TUIStore.getData(StoreName.USER, 'displayMessageReadReceipt'));

onMounted(() => {
  TUIStore.watch(StoreName.USER, {
    displayMessageReadReceipt: onDisplayMessageReadReceiptUpdate,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.USER, {
    displayMessageReadReceipt: onDisplayMessageReadReceiptUpdate,
  });
});

const isShowReadStatus = computed<boolean>(() => {
  if (!isDisplayMessageReadReceipt.value) {
    // 用户级已读回执开关关闭 不展示已读状态
    return false;
  }

  const {
    ID,
    type,
    flow,
    status,
    hasRiskContent,
    conversationID,
    conversationType,
    needReadReceipt = false,
  } = props.message;

  // 异步消息打击 消息已发出判断是否存在风险内容
  if (hasRiskContent) {
    return false;
  }

  const { groupProfile } = TUIStore.getConversationModel(conversationID) || {};
  // 直播群以及社群不展示已读状态
  if (groupProfile?.type === TYPES.GRP_AVCHATROOM || groupProfile?.type === TYPES.GRP_COMMUNITY) {
    return false;
  }

  if (type === TYPES.MSG_CUSTOM) {
    const message = TUIStore.getMessageModel(ID);
    // 如果是信令消息 不展示阅读状态
    if (message?.getSignalingInfo() !== null) {
      return false;
    }
  }

  // 未成功消息 接收消息 不展示阅读状态
  if (flow !== 'out' || status !== 'success') {
    return false;
  }

  if (conversationType === 'GROUP') {
    return needReadReceipt;
  } else if (conversationType === 'C2C') {
    return true;
  }
  return false;
});

const readState = computed<ReadState>(() => {
  const { conversationType, needReadReceipt = false, isPeerRead = false } = props.message;
  const { readCount = 0, unreadCount = 0, isPeerRead: isReceiptPeerRead = false } = props.message.readReceiptInfo;
  if (conversationType === 'C2C') {
    if (needReadReceipt) {
      return isReceiptPeerRead ? ReadState.Read : ReadState.Unread;
    } else {
      return isPeerRead ? ReadState.Read : ReadState.Unread;
    }
  } else if (conversationType === 'GROUP') {
    if (needReadReceipt) {
      if (readCount === 0) {
        return ReadState.Unread;
      } else if (unreadCount === 0) {
        return ReadState.AllRead;
      } else {
        return ReadState.PartiallyRead;
      }
    } else {
      return ReadState.NotShow;
    }
  }
  return ReadState.Unread;
});

const readStatusText = computed(() => {
  const { readCount = 0 } = props.message.readReceiptInfo;
  switch (readState.value) {
    case ReadState.Read:
      return TUITranslateService.t('TUIChat.已读');
    case ReadState.Unread:
      return TUITranslateService.t('TUIChat.未读');
    case ReadState.AllRead:
      return TUITranslateService.t('TUIChat.全部已读');
    case ReadState.PartiallyRead:
      return `${readCount}${TUITranslateService.t('TUIChat.人已读')}`;
    default:
      return '';
  }
});

const isUseUnreadStyle = computed(() => {
  const { conversationType } = props.message;
  if (conversationType === 'C2C') {
    return readState.value !== ReadState.Read;
  } else if (conversationType === 'GROUP') {
    return readState.value !== ReadState.AllRead;
  }
  return false;
});

const isHoverFingerPointer = computed<boolean>(() => {
  return (
    props.message.needReadReceipt
    && props.message.conversationType === 'GROUP'
    && (readState.value === ReadState.PartiallyRead || readState.value === ReadState.Unread)
  );
});

function openReadUserPanel() {
  if (isHoverFingerPointer.value) {
    emits('openReadUserPanel');
  }
}

function onDisplayMessageReadReceiptUpdate(isDisplay: boolean) {
  isDisplayMessageReadReceipt.value = isDisplay;
}
</script>

<style scoped lang="scss">
.message-label {
  align-self: flex-end;
  font-size: 12px;
  color: #b6b8ba;
  word-break: keep-all;
  flex: 0 0 auto;

  &.unread {
    color: #679ce1 !important;
  }
}

.finger-point {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
