<template>
  <div
    class="tui-chat"
    :class="[!isPC ? 'tui-chat-h5' : '']"
  >
    <div
      id="tui-chat-main"
      class="tui-chat-main"
      @click="closeChatPop"
    >
      <!-- 安全提示 -->
      <div class="tui-chat-safe-tips">
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
      <div
        v-if="isGroup && groupApplicationCount > 0"
        class="tui-chat-application-tips"
        @click="toggleApplicationList()"
      >
        <span>
          {{ groupApplicationCount }}{{ TUITranslateService.t("TUIChat.条入群申请") }}
          <span class="application-tips-btn">
            {{ TUITranslateService.t("TUIChat.点击处理") }}
          </span>
        </span>
      </div>
      <!-- 消息列表 -->
      <ul
        id="messageScrollList"
        ref="messageListRef"
        class="tui-message-list"
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
          <!-- 消息时间组件 -->
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
              @longpress="handleToggleMessageItem($event, item, true)"
              @click.prevent.right="handleToggleMessageItemForPC($event, item)"
              @touchstart="handleH5LongPress($event, item, 'touchstart')"
              @touchend="handleH5LongPress($event, item, 'touchend')"
              @mouseover="handleH5LongPress($event, item, 'touchend')"
            >
              <MessageBubble
                :messageItem="JSON.parse(JSON.stringify(item))"
                :content="item.getMessageContent()"
                :blinkMessageIDList="blinkMessageIDList"
                @resendMessage="resendMessage(item)"
                @blinkMessage="blinkMessage"
                @setReadReceiptPanelVisible="setReadReceiptPanelVisible"
              >
                <template #messageElement>
                  <MessageText
                    v-if="item.type === TYPES.MSG_TEXT"
                    :content="item.getMessageContent()"
                  />
                  <ProgressMessage
                    v-if="item.type === TYPES.MSG_IMAGE"
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
                    v-if="item.type === TYPES.MSG_VIDEO"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  >
                    <MessageVideo
                      :content="item.getMessageContent()"
                      :messageItem="item"
                    />
                  </ProgressMessage>
                  <MessageAudio
                    v-if="item.type === TYPES.MSG_AUDIO"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  />
                  <ProgressMessage
                    v-if="item.type === TYPES.MSG_FILE"
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  >
                    <MessageFile
                      :content="item.getMessageContent()"
                      :messageItem="item"
                    />
                  </ProgressMessage>
                  <MessageFace
                    v-if="item.type === TYPES.MSG_FACE"
                    :content="item.getMessageContent()"
                    :isPC="isPC"
                  />
                  <MessageLocation
                    v-if="item.type === TYPES.MSG_LOCATION"
                    :content="item.getMessageContent()"
                  />
                  <MessageCustom
                    v-if="item.type === TYPES.MSG_CUSTOM"
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
            <MessageTool
              v-if="item.ID === toggleID"
              ref="messageToolListRef"
              :class="[
                'message-tool',
                item.flow === 'out' ? 'message-tool-out' : 'message-tool-in', isTopMessageDom ? 'message-tool-bottom' : ''
              ]"
              :messageItem="item"
            >
              <!-- 必须加 template, 否则不生效 -->
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
      <!-- 滚动按钮 -->
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
      <!-- 图片预览 -->
      <ImagePreviewer
        v-if="showImagePreview"
        :currentImage="currentImagePreview"
        :imageList="imageMessageList"
        @close="onImagePreviewerClose"
      />
      <!-- 加群申请系统消息 -->
      <MessageGroupSystem
        v-if="showGroupApplication"
        :groupID="groupID"
        @toggleApplicationList="toggleApplicationList"
        @handleGroupApplication="handleGroupApplication"
      />
      <!-- 已读回执用户列表面板 -->
      <ReadReceiptPanel
        v-if="isShowReadUserStatusPanel"
        :message="Object.assign({}, readStatusMessage)"
        @setReadReceiptPanelVisible="setReadReceiptPanelVisible"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed, onMounted, onUnmounted } from '../../../adapter-vue';
import TUIChatEngine, {
  IMessageModel,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIChatService,
  TUIGroupService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import { outsideClick, getBoundingClientRect, getScrollInfo } from '@tencentcloud/universal-api';
import { TUIEmojiPlugin } from '@tencentcloud/tui-emoji-plugin';
import throttle from 'lodash/throttle';
import Link from './link';
import MessageText from './message-elements/message-text.vue';
import MessageImage from './message-elements/message-image.vue';
import MessageAudio from './message-elements/message-audio.vue';
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
import MessageGroupSystem from './message-elements/message-group-system.vue';
import Dialog from '../../common/Dialog/index.vue';
import ImagePreviewer from '../../common/ImagePreviewer/index.vue';
import ProgressMessage from '../../common/ProgressMessage/index.vue';
import { emojiConfig } from '../utils/emoji-config';
import { isPC, isH5 } from '../../../utils/env';
import { isEnabledMessageReadReceiptGlobal, shallowCopyMessage, isCreateGroupCustomMessage, deepCopy } from '../utils/utils';

import { IGroupApplicationListItem } from '../../../interface';

interface ScrollConfig {
  scrollToMessage?: IMessageModel;
  scrollToBottom?: boolean;
  scrollToOffset?: {
    top?: number;
    bottom?: number;
  };
}

const emits = defineEmits(['handleEditor']);
const props = defineProps({
  groupID: {
    type: String,
    default: '',
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});
// 表情回应相关
const enabledEmojiPlugin = TUIStore.getData(StoreName.APP, 'enabledEmojiPlugin');
let observer: IntersectionObserver | null = null;
let groupType: string | undefined;
const sentReceiptMessageIDSet = new Set<string>();
const messageListRef = ref<HTMLElement>();
const messageToolListRef = ref<Array<{ messageToolDom: HTMLElement }>>();
// 上屏展示 messageList，不包含 isDeleted 为 true 的 message
const messageList = ref<Array<IMessageModel>>();
// 所有 messageList 序列，包含 isDeleted 为 true 的 message
const allMessageList = ref<Array<IMessageModel>>();
const isCompleted = ref(false);
const currentConversationID = ref('');
const currentLastMessage = ref<IMessageModel>();
const currentLastMessageTime = ref<number>(0);
const nextReqMessageID = ref();
const toggleID = ref('');
const TYPES = ref(TUIChatEngine.TYPES);
const isLongpressing = ref(false);
const groupApplicationCount = ref(0);
const showGroupApplication = ref(false);
const applicationUserIDList = ref<Array<string>>([]);
const messageTarget = ref<IMessageModel>();
const messageElementListRef = ref<Array<HTMLElement> | null>();
const targetMessageDom = ref<HTMLElement | null>();
const blinkMessageIDList = ref<string[]>([]);
const scrollButtonInstanceRef = ref<InstanceType<typeof ScrollButton>>();
const isShowReadUserStatusPanel = ref<boolean>(false);
const readStatusMessage = ref<IMessageModel>();
const beforeHistoryGetScrollHeight = ref<number>(0);
const isTopMessageDom = ref<boolean>(false);

// 图片预览相关
const showImagePreview = ref(false);
const currentImagePreview = ref<IMessageModel>();
const imageMessageList = computed(() =>
  messageList?.value?.filter((item: IMessageModel) => {
    return !item.isRevoked && !item.hasRiskContent && item.type === TYPES.value.MSG_IMAGE;
  }),
);

// 消息重发 Dialog
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
// 事件监听
onMounted(() => {
  // 消息 messageList
  TUIStore.watch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    messageSource: onMessageSourceUpdated,
    isCompleted: isCompletedUpdated,
  });

  // 当前 ConversationID
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  // 群未决消息列表
  TUIStore.watch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeList,
  });

  // 群未决消息数量 | 关闭消息操作 popMenu
  TUIStore.watch(StoreName.CUSTOM, {
    groupApplicationCount: groupApplicationCountUpdated,
    isShowMessagePopMenu: isShowMessagePopMenuUpdated,
  });
});

// 绑定监听滚动事件 展示scroll-button
onMounted(() => {
  messageListRef.value?.addEventListener('scroll', handelScrollListScroll);
});

// 取消监听
onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    messageSource: onMessageSourceUpdated,
    isCompleted: isCompletedUpdated,
  });

  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
    currentConversation: onCurrentConversationUpdated,
  });

  TUIStore.unwatch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeList,
  });

  messageListRef.value?.removeEventListener('scroll', handelScrollListScroll);

  sentReceiptMessageIDSet.clear();
  observer?.disconnect();
  observer = null;
});

async function onMessageListUpdated(list: Array<IMessageModel>) {
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
  // messageSource change 有两种情况
  // 1. messageSource change -> 未命中缓存 -> messageList change,
  // 2. messageSource change -> 命中缓存 -> messageList not change
  // 只有第二种情况需要在此处监听时增加 scrollToTarget
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

function groupApplicationCountUpdated(count: number) {
  groupApplicationCount.value = count;
}

function isShowMessagePopMenuUpdated(isShow: boolean) {
  if (!isShow) {
    toggleID.value = '';
  }
}

// 监听回调函数
const onCurrentConversationIDUpdated = (conversationID: string) => {
  currentConversationID.value = conversationID;
  // 增加清空 messageList 条件，当前无正在开启会话时才清空
  // 避免 H5 二次打开相同会话（已有 messageList 缓存）下，onCurrentConversationIDUpdated 晚与 onMessageListUpdated 触发导致消息被清空
  if (!currentConversationID.value) {
    messageList.value = [];
  }
  // 获取加群系统消息列表
  TUIGroupService.getGroupApplicationList().then((res: any) => {
    const applicationList = res.data.applicationList.filter(
      (application: any) => application.groupID === props.groupID,
    );
    applicationUserIDList.value = applicationList.map((application: IGroupApplicationListItem) => {
      return application.applicationType === 0 ? application.applicant : application.userID;
    });
    TUIStore.update(StoreName.CUSTOM, 'groupApplicationCount', applicationList.length);
  });

  // 开启已读回执的状态 群聊缓存群类型
  if (isEnabledMessageReadReceiptGlobal()) {
    const { groupProfile } = TUIStore.getConversationModel(conversationID) || {};
    groupType = groupProfile?.type;
  }
};

const onCurrentConversationUpdated = (conversation: IConversationModel) => {
  currentLastMessageTime.value = conversation?.lastMessage?.lastTime || 0;
};

// operationType 操作类型 1: 有用户申请加群   23: 普通群成员邀请用户进群
const onGroupSystemNoticeList = (list: Array<IMessageModel>) => {
  const systemNoticeList = list.filter((message) => {
    const { operationType } = message.payload;
    return (operationType === 1 || operationType === 23) && message.to === props.groupID;
  });

  systemNoticeList.forEach((systemNotice) => {
    const { operationType } = systemNotice.payload;
    if (operationType === 1) {
      const { operatorID } = systemNotice.payload;
      if (!applicationUserIDList.value.includes(operatorID)) {
        applicationUserIDList.value.push(operatorID);
      }
    }
    if (operationType === 23) {
      const { inviteeList } = systemNotice.payload;
      inviteeList.forEach((invitee: string) => {
        if (!applicationUserIDList.value.includes(invitee)) {
          applicationUserIDList.value.push(invitee);
        }
      });
    }
  });
  const applicationCount = applicationUserIDList.value.length;
  TUIStore.update(StoreName.CUSTOM, 'groupApplicationCount', applicationCount);
};

const toggleApplicationList = () => {
  showGroupApplication.value = !showGroupApplication.value;
};

const handleGroupApplication = (userID: string) => {
  const index = applicationUserIDList.value.indexOf(userID);
  if (index !== -1) {
    applicationUserIDList.value.splice(index, 1);
  }
};

// 获取历史消息
const getHistoryMessageList = () => {
  TUIChatService.getMessageList().then((res: any) => {
    const { nextReqMessageID: ID } = res.data;
    nextReqMessageID.value = ID;
  });
  // 获取历史消息后，保持滚动条在原来位置
  beforeHistoryGetScrollHeight.value = messageListRef.value?.scrollHeight;
};

const openComplaintLink = (type: any) => {
  window.open(type.url);
};

// 图片预览
const handleImagePreview = (message: IMessageModel) => {
  if (showImagePreview.value || currentImagePreview.value || isLongpressing.value) {
    return;
  }
  showImagePreview.value = true;
  currentImagePreview.value = message;
};
// 关闭图片预览
const onImagePreviewerClose = () => {
  showImagePreview.value = false;
  currentImagePreview.value = null;
};

// 消息操作
const handleToggleMessageItem = (e: any, message: IMessageModel, isLongpress = false) => {
  if (isLongpress) {
    isLongpressing.value = true;
  }
  toggleID.value = message.ID;
  filterTopMessageDom(e.target);
};

const handleToggleMessageItemForPC = (e: MouseEvent, message: IMessageModel) => {
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

// 判断 chat 可视区域顶部的 message 元素
function filterTopMessageDom(toggleMessageElement: any) {
  // 获取元素
  const chatElement = document.getElementById('tui-chat-main');
  const safeTop = 160; // 防止被安全提示遮挡
  const messageElementRect = toggleMessageElement.getBoundingClientRect(); // 当前 message 距离可视窗口的信息
  const ChatElementRect = chatElement.getBoundingClientRect();
  isTopMessageDom.value = messageElementRect.top - ChatElementRect.top < safeTop ? true : false;
}

// h5 long press
let timer: number;
const handleH5LongPress = (e: any, message: IMessageModel, type: string) => {
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

// 消息撤回后，编辑消息
const handleEdit = (message: IMessageModel) => {
  emits('handleEditor', message, 'reedit');
};

// 重发消息
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

// 滚动到最新消息
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
  if (messageList.value.length === 0) {
    return;
  }

  if (groupType === TYPES.value.GRP_AVCHATROOM || groupType === TYPES.value.GRP_COMMUNITY) {
    // 直播群以及社群不进行消息的已读回执监听
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

</script>
<style lang="scss" scoped src="./style/index.scss"></style>
