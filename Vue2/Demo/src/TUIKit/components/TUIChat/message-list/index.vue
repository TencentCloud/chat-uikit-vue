<template>
  <div
    class="tui-chat"
    :class="[isH5 ? 'tui-chat-h5' : '']"
  >
    <!-- <JoinGroupCard v-if="isH5" /> -->
    <div
      id="tui-chat-main"
      class="tui-chat-main"
      @click="closeChatPop"
    >
      <!-- Safe Tips -->
      <div
        v-if="isOfficial"
        class="tui-chat-safe-tips"
      >
        <span>
          {{
            TUITranslateService.t(
              "TUIChat.【安全提示】本 APP 仅用于体验腾讯云即时通信 IM 产品功能，不可用于业务洽谈与拓展。请勿轻信汇款、中奖等涉及钱款的信息，勿轻易拨打陌生电话，谨防上当受骗。"
            )
          }}
        </span>
        <a @click="openComplaintLink(Link.complaint)">
          {{ TUITranslateService.t("TUIChat.点此投诉") }}
        </a>
      </div>
      <MessageGroupApplication
        v-if="isGroup"
        :key="props.groupID"
        :groupID="props.groupID"
      />
      <!-- Message List -->
      <ul
        id="messageScrollList"
        ref="messageListRef"
        class="tui-message-list"
        @click="onMessageListBackgroundClick"
      >
        <p
          v-if="!isCompleted"
          class="message-more"
          @click="getHistoryMessageList"
        >
          {{ TUITranslateService.t("TUIChat.查看更多") }}
        </p>
        <li
          v-for="(item, index) in messageList"
          :id="'tui-' + item.ID"
          :key="item.ID"
          ref="messageElementListRef"
          class="message-li"
        >
          <MessageTimestamp
            :currTime="item.time"
            :prevTime="index > 0 ? messageList[index - 1].time : 0"
          />
          <div class="message-item">
            <MessageTip
              v-if="item.type === TYPES.MSG_GRP_TIP || isCreateGroupCustomMessage(item)"
              :content="item.getMessageContent()"
              :blinkMessageIDList="blinkMessageIDList"
              @blinkMessage="blinkMessage"
            />
            <MessageRevoked
              v-else-if="item.isRevoked"
              :isEdit="item.type === TYPES.MSG_TEXT"
              :messageItem="item"
              @messageEdit="handleEdit(item)"
            />
            <MessagePlugin
              v-else-if="isPluginMessage(item)"
              :message="deepCopy(item)"
              :blinkMessageIDList="blinkMessageIDList"
              @resendMessage="resendMessage"
              @handleToggleMessageItem="handleToggleMessageItem"
              @handleH5LongPress="handleH5LongPress"
            />
            <div
              v-else
              :class="{
                'message-event-bind-div': true,
              }"
              @longpress="handleToggleMessageItem($event, item, true)"
              @click.prevent.right="handleToggleMessageItemForPC($event, item)"
              @touchstart="handleH5LongPress($event, item, 'touchstart')"
              @touchend="handleH5LongPress($event, item, 'touchend')"
              @mouseover="handleH5LongPress($event, item, 'touchend')"
            >
              <MessageBubble
                :content="item.getMessageContent()"
                :isAudioPlayed="Boolean(audioPlayedMapping[item.ID])"
                :blinkMessageIDList="blinkMessageIDList"
                :isMultipleSelectMode="isMultipleSelectMode"
                :messageItem="JSON.parse(JSON.stringify(item))"
                :multipleSelectedMessageIDList="multipleSelectedMessageIDList"
                @blinkMessage="blinkMessage"
                @resendMessage="resendMessage(item)"
                @changeSelectMessageIDList="changeSelectMessageIDList"
                @setReadReceiptPanelVisible="setReadReceiptPanelVisible"
              >
                <template #messageElement>
                  <MessageText
                    v-if="item.type === TYPES.MSG_TEXT"
                    :content="item.getMessageContent()"
                  />
                  <ProgressMessage
                    v-else-if="item.type === TYPES.MSG_IMAGE"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  >
                    <MessageImage
                      :content="item.getMessageContent()"
                      :messageItem="item"
                      @previewImage="handleImagePreview"
                    />
                  </ProgressMessage>
                  <ProgressMessage
                    v-else-if="item.type === TYPES.MSG_VIDEO"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  >
                    <MessageVideo
                      :content="item.getMessageContent()"
                      :messageItem="item"
                    />
                  </ProgressMessage>
                  <MessageAudio
                    v-else-if="item.type === TYPES.MSG_AUDIO"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                    @setAudioPlayed="setAudioPlayed"
                  />
                  <ProgressMessage
                    v-else-if="item.type === TYPES.MSG_FILE"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  >
                    <MessageFile
                      :content="item.getMessageContent()"
                      :messageItem="item"
                    />
                  </ProgressMessage>
                  <MessageRecord
                    v-else-if="item.type === TYPES.MSG_MERGER"
                    :renderData="item.payload"
                    :messageItem="item"
                  />
                  <MessageFace
                    v-else-if="item.type === TYPES.MSG_FACE"
                    :content="item.getMessageContent()"
                  />
                  <MessageLocation
                    v-else-if="item.type === TYPES.MSG_LOCATION"
                    :content="item.getMessageContent()"
                  />
                  <MessageCustom
                    v-else-if="item.type === TYPES.MSG_CUSTOM"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  />
                </template>
                <template #TUIEmojiPlugin>
                  <TUIEmojiPlugin
                    v-if="isShowEmojiPlugin && item.reactionList.length > 0"
                    type="reaction-detail"
                    :emojiConfig="emojiConfig"
                    :message="shallowCopyMessage(item)"
                  />
                </template>
              </MessageBubble>
            </div>
            <!-- message tool -->
            <MessageTool
              v-if="item.ID === toggleID"
              ref="messageToolListRef"
              :class="{
                'message-tool': true,
                'message-tool-out': item.flow === 'out',
                'message-tool-in': item.flow === 'in',
                'message-tool-bottom': isTopMessageDom
              }"
              :messageItem="item"
              :isMultipleSelectMode="isMultipleSelectMode"
              @toggleMultipleSelectMode="() => emits('toggleMultipleSelectMode')"
            >
              <template #TUIEmojiPlugin>
                <TUIEmojiPlugin
                  v-if="isShowEmojiPlugin"
                  :message="item"
                  :emojiConfig="emojiConfig"
                />
              </template>
            </MessageTool>
          </div>
        </li>
      </ul>
      <ScrollButton
        ref="scrollButtonInstanceRef"
        @scrollToLatestMessage="scrollToLatestMessage"
      />
      <Dialog
        v-if="reSendDialogShow"
        class="resend-dialog"
        :show="reSendDialogShow"
        :isH5="!isPC"
        :center="true"
        :isHeaderShow="isPC"
        @submit="resendMessageConfirm()"
        @update:show="(e) => (reSendDialogShow = e)"
      >
        <p class="delDialog-title">
          {{ TUITranslateService.t("TUIChat.确认重发该消息？") }}
        </p>
      </Dialog>
      <ImagePreviewer
        v-if="showImagePreview"
        :currentImage="currentImagePreview"
        :imageList="imageMessageList"
        @close="onImagePreviewerClose"
      />
      <ReadReceiptPanel
        v-if="isShowReadUserStatusPanel"
        :message="Object.assign({}, readStatusMessage)"
        @setReadReceiptPanelVisible="setReadReceiptPanelVisible"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed, onMounted, onUnmounted, watch } from '../../../adapter-vue';
import TUIChatEngine, {
  IMessageModel,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIChatService,
} from '@tencentcloud/chat-uikit-engine';
import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import { outsideClick, getBoundingClientRect, getScrollInfo } from '@tencentcloud/universal-api';
import { TUIEmojiPlugin } from '@tencentcloud/tui-emoji-plugin';
// import { JoinGroupCard } from '@tencentcloud/call-uikit-vue';
import throttle from 'lodash/throttle';
import Link from './link';
import MessageGroupApplication from './message-group-application/index.vue';
import MessageText from './message-elements/message-text.vue';
import MessageImage from './message-elements/message-image.vue';
import MessageAudio from './message-elements/message-audio.vue';
import MessageRecord from './message-elements/message-record/index.vue';
import MessageFile from './message-elements/message-file.vue';
import MessageFace from './message-elements/message-face.vue';
import MessageCustom from './message-elements/message-custom.vue';
import MessageTip from './message-elements/message-tip.vue';
import MessageBubble from './message-elements/message-bubble.vue';
import MessageLocation from './message-elements/message-location.vue';
import MessageTimestamp from './message-elements/message-timestamp.vue';
import MessageVideo from './message-elements/message-video.vue';
import MessageTool from './message-tool/index.vue';
import MessageRevoked from './message-tool/message-revoked.vue';
import MessagePlugin from '../../../plugins/plugin-components/message-plugin.vue';
import ScrollButton from './scroll-button/index.vue';
import ReadReceiptPanel from './read-receipt-panel/index.vue';
import { isPluginMessage } from '../../../plugins/plugin-components/index';
import Dialog from '../../common/Dialog/index.vue';
import ImagePreviewer from '../../common/ImagePreviewer/index.vue';
import ProgressMessage from '../../common/ProgressMessage/index.vue';
import { emojiConfig } from '../emoji-config';
import { isPC, isH5 } from '../../../utils/env';
import chatStorage from '../utils/chatStorage';
import { isEnabledMessageReadReceiptGlobal, shallowCopyMessage, isCreateGroupCustomMessage, deepCopy } from '../utils/utils';

interface ScrollConfig {
  scrollToMessage?: IMessageModel;
  scrollToBottom?: boolean;
  scrollToOffset?: {
    top?: number;
    bottom?: number;
  };
}

interface IProps {
  isGroup: boolean;
  groupID: string;
  isMultipleSelectMode: boolean;
}

interface IEmits {
  (key: 'closeInputToolBar'): void;
  (key: 'toggleMultipleSelectMode'): void;
  (key: 'handleEditor', message: IMessageModel, type: string): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  isGroup: false,
  groupID: '',
  isMultipleSelectMode: false,
});

let groupType: string | undefined;
let observer: IntersectionObserver | null = null;
const sentReceiptMessageIDSet = new Set<string>();
const isOfficial = TUIStore.getData(StoreName.APP, 'isOfficial');
const enabledEmojiPlugin = TUIStore.getData(StoreName.APP, 'enabledEmojiPlugin');

const messageListRef = ref<HTMLElement>();
const messageToolListRef = ref<Array<{ messageToolDom: HTMLElement }>>();
// The messageList displayed on the screen, not including messages where isDeleted is true
const messageList = ref<IMessageModel[]>();
// All messageList, including messages where isDeleted is true
const allMessageList = ref<IMessageModel[]>();
const multipleSelectedMessageIDList = ref<string[]>([]);
const isCompleted = ref(false);
const currentConversationID = ref('');
const currentLastMessage = ref<IMessageModel>();
const nextReqMessageID = ref();
const toggleID = ref('');
const TYPES = ref(TUIChatEngine.TYPES);
const isLongpressing = ref(false);
const messageTarget = ref<IMessageModel>();
const messageElementListRef = ref<HTMLElement[] | null>();
const targetMessageDom = ref<HTMLElement | null>();
const blinkMessageIDList = ref<string[]>([]);
const scrollButtonInstanceRef = ref<InstanceType<typeof ScrollButton>>();
const isShowReadUserStatusPanel = ref<boolean>(false);
const readStatusMessage = ref<IMessageModel>();
const beforeHistoryGetScrollHeight = ref<number>(0);
const isTopMessageDom = ref<boolean>(false);
const audioPlayedMapping = ref<Record<string, boolean>>({});

// image preview
const showImagePreview = ref(false);
const currentImagePreview = ref<IMessageModel>();
const imageMessageList = computed(() =>
  messageList?.value?.filter((item: IMessageModel) => {
    return !item.isRevoked && !item.hasRiskContent && item.type === TYPES.value.MSG_IMAGE;
  }),
);

// resend message dialog
const reSendDialogShow = ref(false);
const resendMessageData = ref();

const isShowEmojiPlugin = computed(() => {
  const msgPopMenuExtensionList = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.MSG_POP_MENU.EXT_ID, {
    enabledEmojiPlugin,
  });
  return msgPopMenuExtensionList.some((item) => {
    return item.text === 'TUIEmojiPlugin';
  });
});

onMounted(() => {
  // Retrieve the information about whether the audio has been played from localStorage
  audioPlayedMapping.value = chatStorage.getChatStorage('audioPlayedMapping') || {};

  TUIStore.watch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    messageSource: onMessageSourceUpdated,
    isCompleted: isCompletedUpdated,
  });

  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  TUIStore.watch(StoreName.CUSTOM, {
    isShowMessagePopMenu: isShowMessagePopMenuUpdated,
  });
});

onMounted(() => {
  messageListRef.value?.addEventListener('scroll', handelScrollListScroll);
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    messageSource: onMessageSourceUpdated,
    isCompleted: isCompletedUpdated,
  });

  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  TUIStore.unwatch(StoreName.CUSTOM, {
    isShowMessagePopMenu: isShowMessagePopMenuUpdated,
  });

  messageListRef.value?.removeEventListener('scroll', handelScrollListScroll);

  if (Object.keys(audioPlayedMapping.value).length > 0) {
    // Synchronize storage about whether the audio has been played when the component is unmounted
    chatStorage.setChatStorage('audioPlayedMapping', audioPlayedMapping.value);
  }

  sentReceiptMessageIDSet.clear();
  observer?.disconnect();
  observer = null;
});

async function onMessageListUpdated(list: IMessageModel[]) {
  observer?.disconnect();
  const oldLastMessage = currentLastMessage.value;
  let hasEmojiReaction = false;
  allMessageList.value = list;
  messageList.value = list.filter((message) => {
    if (message.reactionList?.length && !message.isDeleted) {
      hasEmojiReaction = true;
    }
    return !message.isDeleted;
  });
  if (!messageList.value?.length) {
    currentLastMessage.value = {};
    return;
  }
  const newLastMessage = messageList.value?.[messageList.value?.length - 1];
  if (messageTarget.value) {
    if (
      messageList.value?.findIndex(
        (message: IMessageModel) => message?.ID === messageTarget.value?.ID,
      ) >= 0
    ) {
      const tempMessage = messageTarget.value;
      messageTarget.value = undefined;
      await scrollToPosition({ scrollToMessage: tempMessage });
      await blinkMessage(tempMessage?.ID);
    }
  } else if (beforeHistoryGetScrollHeight.value) {
    await scrollToPosition({
      scrollToOffset: { bottom: beforeHistoryGetScrollHeight.value },
    });
    beforeHistoryGetScrollHeight.value = 0;
  } else if (scrollButtonInstanceRef.value?.isScrollButtonVisible && newLastMessage?.flow === 'in') {
    return;
  } else if (
    newLastMessage?.ID
    && JSON.stringify(oldLastMessage) !== JSON.stringify(newLastMessage)
  ) {
    await scrollToPosition({ scrollToBottom: true });
  } else if (hasEmojiReaction && isCurrentListInBottomPosition()) {
    await scrollToPosition({ scrollToBottom: true });
  }
  currentLastMessage.value = Object.assign({}, newLastMessage);
  if (isEnabledMessageReadReceiptGlobal()) {
    nextTick(() => bindIntersectionObserver());
  }
}

function isCurrentListInBottomPosition() {
  return (
    messageListRef.value
    && typeof messageListRef.value.scrollTop === 'number'
    && typeof messageListRef.value.scrollHeight === 'number'
    && typeof messageListRef.value.clientHeight === 'number'
    && Math.ceil(
      messageListRef.value.scrollTop + messageListRef.value.clientHeight,
    ) >= messageListRef.value.scrollHeight
  );
}

async function scrollToPosition(config: ScrollConfig = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    requestAnimationFrame(() => {
      if (!messageListRef.value) {
        reject();
      }
      const container = messageListRef.value;
      if (config.scrollToBottom) {
        container!.scrollTop = container!.scrollHeight;
      } else if (config.scrollToMessage) {
        const targetMessageDom = messageElementListRef.value?.find(
          (dom: HTMLElement) => dom?.id === `tui-${config.scrollToMessage?.ID}`,
        );
        if (targetMessageDom?.scrollIntoView) {
          targetMessageDom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else if (config.scrollToOffset) {
        if (config.scrollToOffset?.top) {
          container!.scrollTop = config.scrollToOffset.top;
        } else if (config.scrollToOffset?.bottom) {
          container!.scrollTop = container!.scrollHeight - config.scrollToOffset.bottom;
        }
      }
      resolve();
    });
  });
}

async function onMessageSourceUpdated(message: IMessageModel) {
  // messageSource change has two cases
  // 1. messageSource change -> cache miss -> messageList change,
  // 2. messageSource change -> cache hit -> messageList not change
  // Only the second case needs to add scrollToTarget when listening here
  messageTarget.value = message;
  if (messageTarget.value) {
    if (
      messageList.value?.findIndex(
        (message: IMessageModel) => message?.ID === messageTarget.value?.ID,
      ) >= 0
    ) {
      const tempMessage = messageTarget.value;
      messageTarget.value = undefined;
      await scrollToPosition({ scrollToMessage: tempMessage });
      await blinkMessage(tempMessage?.ID);
    }
  }
}

function isCompletedUpdated(flag: boolean) {
  isCompleted.value = flag;
}

function isShowMessagePopMenuUpdated(isShow: boolean) {
  if (!isShow) {
    toggleID.value = '';
  }
}

const onCurrentConversationIDUpdated = (conversationID: string) => {
  currentConversationID.value = conversationID;
  if (!currentConversationID.value) {
    messageList.value = [];
  }
  if (isEnabledMessageReadReceiptGlobal()) {
    const { groupProfile } = TUIStore.getConversationModel(conversationID) || {};
    groupType = groupProfile?.type;
  }
  if (Object.keys(audioPlayedMapping.value).length > 0) {
    // Synchronize storage about whether the audio has been played when converstaion switched
    chatStorage.setChatStorage('audioPlayedMapping', audioPlayedMapping.value);
  }
};

const getHistoryMessageList = () => {
  TUIChatService.getMessageList().then((res: any) => {
    const { nextReqMessageID: ID } = res.data;
    nextReqMessageID.value = ID;
  });
  // After getting the historical messages, keep the scroll bar in the original position
  beforeHistoryGetScrollHeight.value = messageListRef.value?.scrollHeight;
};

const openComplaintLink = (type: any) => {
  window.open(type.url);
};

const handleImagePreview = (message: IMessageModel) => {
  if (showImagePreview.value || currentImagePreview.value || isLongpressing.value) {
    return;
  }
  showImagePreview.value = true;
  currentImagePreview.value = message;
};

const onImagePreviewerClose = () => {
  showImagePreview.value = false;
  currentImagePreview.value = null;
};

// toggle message
const handleToggleMessageItem = (e: any, message: IMessageModel, isLongpress = false) => {
  if (props.isMultipleSelectMode) {
    return;
  }
  if (isLongpress) {
    isLongpressing.value = true;
  }
  toggleID.value = message.ID;
  filterTopMessageDom(e.target);
};

const handleToggleMessageItemForPC = (e: MouseEvent, message: IMessageModel) => {
  if (props.isMultipleSelectMode) {
    return;
  }
  if (isPC) {
    toggleID.value = message.ID;
    targetMessageDom.value = messageElementListRef.value?.find((dom: HTMLElement) => dom?.id === `tui-${message.ID}`);
    nextTick(() => {
      const ignoreDomRefs = messageToolListRef.value && messageToolListRef.value[0]?.messageToolDom;
      outsideClick.listen({
        domRefs: targetMessageDom.value,
        ignoreDomRefs: ignoreDomRefs,
        handler: closeChatPop,
        button: e.button,
      });
      filterTopMessageDom(e.target);
    });
  }
};

function filterTopMessageDom(toggleMessageElement: any) {
  const chatElement = document.getElementById('tui-chat-main');
  const safeTop = 160;
  const messageElementRect = toggleMessageElement.getBoundingClientRect();
  const ChatElementRect = chatElement.getBoundingClientRect();
  isTopMessageDom.value = messageElementRect.top - ChatElementRect.top < safeTop ? true : false;
}

// h5 long press
let timer: number;
const handleH5LongPress = (e: any, message: IMessageModel, type: string) => {
  if (props.isMultipleSelectMode) {
    return;
  }
  if (!isH5) return;
  function longPressHandler() {
    clearTimeout(timer);
    handleToggleMessageItem(e, message);
  }
  function touchStartHandler() {
    timer = setTimeout(longPressHandler, 500);
  }
  function touchEndHandler() {
    clearTimeout(timer);
  }
  switch (type) {
    case 'touchstart':
      touchStartHandler();
      break;
    case 'touchend':
      touchEndHandler();
      setTimeout(() => {
        isLongpressing.value = false;
      }, 200);
      break;
  }
};

// re-edit message
const handleEdit = (message: IMessageModel) => {
  emits('handleEditor', message, 'reedit');
};

const resendMessage = (message: IMessageModel) => {
  reSendDialogShow.value = true;
  resendMessageData.value = message;
};

const resendMessageConfirm = () => {
  reSendDialogShow.value = !reSendDialogShow.value;
  const messageModel = resendMessageData.value;
  messageModel.resendMessage();
};

function blinkMessage(messageID: string): Promise<void> {
  return new Promise((resolve) => {
    const index = blinkMessageIDList.value.indexOf(messageID);
    if (index < 0) {
      blinkMessageIDList.value.push(messageID);
      const timer = setTimeout(() => {
        blinkMessageIDList.value.splice(blinkMessageIDList.value.indexOf(messageID), 1);
        clearTimeout(timer);
        resolve();
      }, 3000);
    }
  });
}

async function scrollToLatestMessage() {
  const { scrollHeight } = await getScrollInfo('#messageScrollList');
  const { height } = await getBoundingClientRect('#messageScrollList');
  if (messageListRef.value) {
    messageListRef.value.scrollTop = scrollHeight - height;
  }
}

const handelScrollListScroll = throttle(function (e: Event) {
  scrollButtonInstanceRef.value?.judgeScrollOverOneScreen(e);
}, 150, { leading: true });

async function bindIntersectionObserver() {
  if (
    !messageList.value
    || !messageListRef.value
    || messageList.value.length === 0
  ) {
    return;
  }

  if (groupType === TYPES.value.GRP_AVCHATROOM || groupType === TYPES.value.GRP_COMMUNITY) {
    // AVCHATROOM and COMMUNITY chats do not monitor read receipts for messages.
    return;
  }

  const mappingFromIDToMessage: Record<string, {
    msgDom: HTMLElement;
    msgModel: IMessageModel | undefined;
  }> = {};

  observer?.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { isIntersecting, target } = entry;
      if (isIntersecting) {
        const { msgDom, msgModel } = mappingFromIDToMessage[target.id];
        if (
          msgModel
          && !msgModel.readReceiptInfo?.isPeerRead
          && !sentReceiptMessageIDSet.has(msgModel.ID)
        ) {
          TUIChatService.sendMessageReadReceipt([msgModel]);
          sentReceiptMessageIDSet.add(msgModel.ID);
          observer?.unobserve(msgDom);
        }
      }
    });
  }, {
    root: messageListRef.value,
    threshold: 0.7,
  });

  const arrayOfMessageLi = messageListRef.value?.querySelectorAll('.message-li');
  if (arrayOfMessageLi) {
    for (let i = 0; i < arrayOfMessageLi?.length; ++i) {
      const messageElement = arrayOfMessageLi[i] as HTMLElement;
      const matchingMessage = messageList.value.find((message: IMessageModel) => {
        return messageElement.id.slice(4) === message.ID;
      });
      if (
        matchingMessage
        && matchingMessage.needReadReceipt
        && matchingMessage.flow === 'in'
      ) {
        mappingFromIDToMessage[messageElement.id] = {
          msgDom: messageElement,
          msgModel: matchingMessage,
        };
        observer?.observe(messageElement);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isSignalingMessage = (message: IMessageModel) => {
  return message?.type === TYPES.value.MSG_CUSTOM && message?.getSignalingInfo();
};

function setReadReceiptPanelVisible(visible: boolean, message?: IMessageModel) {
  if (!visible) {
    readStatusMessage.value = undefined;
  } else {
    readStatusMessage.value = message;
  }
  isShowReadUserStatusPanel.value = visible;
}

function closeChatPop() {
  toggleID.value = '';
}

function onMessageListBackgroundClick() {
  emits('closeInputToolBar');
}

watch(() => props.isMultipleSelectMode, (newValue) => {
  if (!newValue) {
    changeSelectMessageIDList({
      type: 'clearAll',
      messageID: '',
    });
  }
});

function changeSelectMessageIDList({ type, messageID }: { type: 'add' | 'remove' | 'clearAll'; messageID: string }) {
  // TODO need to delete this
  if (type === 'clearAll') {
    multipleSelectedMessageIDList.value = [];
  } else if (type === 'add' && !multipleSelectedMessageIDList.value.includes(messageID)) {
    multipleSelectedMessageIDList.value.push(messageID);
  } else if (type === 'remove') {
    multipleSelectedMessageIDList.value = multipleSelectedMessageIDList.value.filter(id => id !== messageID);
  }
}

function mergeForwardMessage() {
  TUIStore.update(StoreName.CUSTOM, 'multipleForwardMessageID', {
    isMergeForward: true,
    messageIDList: multipleSelectedMessageIDList.value,
  });
}

function oneByOneForwardMessage() {
  TUIStore.update(StoreName.CUSTOM, 'multipleForwardMessageID', {
    isMergeForward: false,
    messageIDList: multipleSelectedMessageIDList.value,
  });
}

function setAudioPlayed(messageID: string) {
  audioPlayedMapping.value = {
    ...audioPlayedMapping.value,
    [messageID]: true,
  };
}

defineExpose({
  oneByOneForwardMessage,
  mergeForwardMessage,
  scrollToLatestMessage,
});
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
<style>
.row-reverse {
  flex-direction: row-reverse;
}
</style>
