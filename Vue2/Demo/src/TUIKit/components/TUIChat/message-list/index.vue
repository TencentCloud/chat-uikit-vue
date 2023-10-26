<template>
  <div class="TUIChat" :class="[!isPC ? 'TUIChat-H5' : '']">
    <div class="TUIChat-main">
      <!-- 安全提示 -->
      <div class="TUIChat-safe-tips">
        <span>
          {{
            TUITranslateService.t(
              "TUIChat.【安全提示】本 APP 仅用于体验腾讯云即时通信 IM 产品功能，不可用于业务洽谈与拓展。请勿轻信汇款、中奖等涉及钱款的信息，勿轻易拨打陌生电话，谨防上当受骗。"
            )
          }}
        </span>
        <a @click="openComplaintLink(Link.complaint)">{{
          TUITranslateService.t("TUIChat.点此投诉")
        }}</a>
      </div>
      <div
        class="TUIChat-application-tips"
        v-if="isGroup && groupApplicationCount > 0"
        @click="toggleApplicationList()"
      >
        <span
          >{{ groupApplicationCount }}{{ TUITranslateService.t("TUIChat.条入群申请") }}
          <span class="application-tips-btn">{{ TUITranslateService.t("TUIChat.点击处理") }}</span>
        </span>
      </div>
      <!-- 消息列表 -->
      <ul class="TUI-message-list" ref="messageListRef" id="messageEle">
        <p class="message-more" @click="getHistoryMessageList" v-if="!isCompleted">
          {{ TUITranslateService.t("TUIChat.查看更多") }}
        </p>
        <li
          v-for="(item, index) in messageList"
          :key="item.ID"
          :id="item.ID"
          ref="messageElementListRef"
          class="message-li"
        >
          <!-- 消息时间组件 -->
          <MessageTimestamp
            :currTime="item.time"
            :prevTime="index > 0 ? messageList[index - 1].time : 0"
          ></MessageTimestamp>
          <div class="message-item" @click.stop="toggleID = ''">
            <MessageTip
              v-if="item.type === TYPES.MSG_GRP_TIP || isCreateGroupCustomMessage(item)"
              :content="item.getMessageContent()"
            />
            <div
              v-else-if="!item.isRevoked && !isSignalingMessage(item)"
              @longpress="handleToggleMessageItem($event, item, true)"
              @click.prevent.right="handleToggleMessageItemForPC($event, item)"
              @touchstart="handleH5LongPress($event, item, 'touchstart')"
              @touchend="handleH5LongPress($event, item, 'touchend')"
              @mouseover="handleH5LongPress($event, item, 'touchend')"
            >
              <MessageBubble
                :messageItem="item"
                :content="item.getMessageContent()"
                @resendMessage="resendMessage(item)"
              >
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
                    @uploading="handleUploadingImageOrVideo"
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
                    @uploading="handleUploadingImageOrVideo"
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
                  <MessageFile :content="item.getMessageContent()" />
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
              </MessageBubble>
            </div>
            <MessagePlugin
              v-else-if="!item.isRevoked"
              :message="item"
              @resendMessage="resendMessage"
              @handleToggleMessageItem="handleToggleMessageItem"
              @handleH5LongPress="handleH5LongPress"
            />
            <MessageRevoked
              v-else
              :isEdit="item.type === TYPES.MSG_TEXT"
              :messageItem="item"
              @messageEdit="handleEdit(item)"
            />
            <MessageTool
              :class="[
                'message-tool',
                item.flow === 'out' ? 'message-tool-out' : 'message-tool-in',
              ]"
              :messageItem="item"
              v-if="item.ID === toggleID"
            />
          </div>
        </li>
        <div class="to-bottom-tip" @click="jumpToLatestMessage" v-if="isShowJumpToLatest">
          <Icon :file="doubleArrowIcon" width="10px" height="10px"></Icon>
          <div class="to-bottom-tip-text">{{ TUITranslateService.t("TUIChat.回到最新位置") }}</div>
        </div>
      </ul>
      <Dialog
        class="resend-dialog"
        v-if="reSendDialogShow"
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
      ></ImagePreviewer>
      <!-- 加群申请系统消息 -->
      <MessageGroupSystem
        v-if="showGroupApplication"
        :groupID="groupID"
        @toggleApplicationList="toggleApplicationList"
        @handleGroupApplication="handleGroupApplication"
      ></MessageGroupSystem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed, onMounted, onUnmounted } from "../../../adapter-vue";

import TUIChatEngine, {
  TUIGlobal,
  IMessageModel,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIChatService,
  TUIGroupService,
  IConversationModel,
} from "@tencentcloud/chat-uikit-engine";

import Link from "./link";
import MessageText from "./message-elements/message-text.vue";
import MessageImage from "./message-elements/message-image.vue";
import MessageAudio from "./message-elements/message-audio.vue";
import MessageFile from "./message-elements/message-file.vue";
import MessageFace from "./message-elements/message-face.vue";
import MessageCustom from "./message-elements/message-custom.vue";
import MessageTip from "./message-elements/message-tip.vue";
import MessageBubble from "./message-elements/message-bubble.vue";
import MessageLocation from "./message-elements/message-location.vue";
import MessageTimestamp from "./message-elements/message-timestamp.vue";
import MessageVideo from "./message-elements/message-video.vue";
import MessageTool from "./message-tool/index.vue";
import MessageRevoked from "./message-tool/message-revoked.vue";
import MessagePlugin from "../../../plugins/plugin-components/message-plugin.vue";

import Dialog from "../../common/Dialog/index.vue";
import ImagePreviewer from "../../common/ImagePreviewer/index.vue";
import ProgressMessage from "../../common/ProgressMessage/index.vue";
import Icon from "../../common/Icon.vue";
import doubleArrowIcon from "../../../assets/icon/double-arrow.svg";
import { getImgLoad, isCreateGroupCustomMessage } from "../utils/utils";
import MessageGroupSystem from "./message-elements/message-group-system.vue";
import { CHAT_SCROLL_TYPE } from "../../../constant";
import { IGroupApplicationListItem } from "../../../interface";

const props = defineProps({
  groupID: {
    type: String,
    default: "",
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});

const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const messageListRef = ref();
const title = ref("TUIChat");
// 上屏展示 messageList，不包含 isDeleted 为 true 的 message
const messageList = ref();
// 所有 messageList 序列，包含 isDeleted 为 true 的 message
const allMessageList = ref();
const isCompleted = ref(false);
const currentConversationID = ref("");
const currentLastMessageTime = ref<number>(0);
const nextReqMessageID = ref();
const toggleID = ref("");
const TYPES = ref(TUIChatEngine.TYPES);
const isLongpressing = ref(false);
const groupApplicationCount = ref(0);
const showGroupApplication = ref(false);
const applicationUserIDList = ref<Array<string>>([]);
const messageJumping = ref<typeof IMessageModel>();
const messageHighlight = ref<typeof IMessageModel>();
const messageElementListRef = ref<Array<HTMLElement | null>>();
const currentHighlightMessage = ref<Array<HTMLElement | null>>();
const isShowJumpToLatest = computed((): boolean => {
  return (
    allMessageList?.value?.length &&
    allMessageList?.value[allMessageList?.value?.length - 1]?.time < currentLastMessageTime?.value
  );
});

const isSignalingMessage = (message: typeof IMessageModel) => {
  return message?.type === TYPES.value.MSG_CUSTOM && message?.getSignalingInfo();
};

// 图片预览相关
const showImagePreview = ref(false);
const currentImagePreview = ref<typeof IMessageModel>();
const imageMessageList = computed(() =>
  messageList?.value?.filter((item: typeof IMessageModel) => {
    return !item.isRevoked && item.type === TYPES.value.MSG_IMAGE;
  })
);

// 消息重发 Dialog
const reSendDialogShow = ref(false);
const resendMessageData = ref();
const emits = defineEmits(["handleEditor"]);

// web & h5 版本（非 uniapp 平台）, 滚动到目标位置(目前仅支持滚动到指定位置)
const scrollToTargetInWeb = (type: string, targetMessage?: typeof IMessageModel) => {
  const scroll = (type: string, targetMessage?: typeof IMessageModel) => {
    switch (type) {
      case CHAT_SCROLL_TYPE.BOTTOM:
        nextTick(() => {
          messageListRef?.value?.lastElementChild?.scrollIntoView &&
            messageListRef?.value?.lastElementChild?.scrollIntoView(false);
        });
        break;
      case CHAT_SCROLL_TYPE.TARGET:
        nextTick(() => {
          if (targetMessage) {
            const targetMessageDom = messageElementListRef?.value?.find(
              (dom: HTMLElement) => dom?.id === targetMessage?.ID
            );
            if (targetMessageDom) {
              targetMessageDom?.scrollIntoView && targetMessageDom?.scrollIntoView(false);
              highlightTargetMessage(targetMessage, targetMessageDom);
            }
          }
        });
        break;
    }
  };
  scroll(type, targetMessage);
  getImgLoad(messageListRef?.value, "message-img", async () => {
    if (messageHighlight?.value || currentHighlightMessage.value) {
      scroll(CHAT_SCROLL_TYPE.TARGET, messageHighlight?.value || currentHighlightMessage.value);
    } else {
      scroll(CHAT_SCROLL_TYPE.BOTTOM);
    }
  });
};

// 监听回调函数
const onCurrentConversationIDUpdated = (conversationID: string) => {
  currentConversationID.value = conversationID;
  messageList.value = [];
  // 获取加群系统消息列表
  TUIGroupService.getGroupApplicationList().then((res: any) => {
    const applicationList = res.data.applicationList.filter(
      (application: any) => application.groupID === props.groupID
    );
    applicationUserIDList.value = applicationList.map((application: IGroupApplicationListItem) => {
      return application.applicationType === 0 ? application.applicant : application.userID;
    });
    TUIStore.update(StoreName.CUSTOM, "groupApplicationCount", applicationList.length);
  });
};

const onCurrentConversationUpdated = (conversation: typeof IConversationModel) => {
  currentLastMessageTime.value = conversation?.lastMessage?.lastTime || 0;
};

// operationType 操作类型 1: 有用户申请加群   23: 普通群成员邀请用户进群
const onGroupSystemNoticeList = (list: Array<typeof IMessageModel>) => {
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
  TUIStore.update(StoreName.CUSTOM, "groupApplicationCount", applicationCount);
};

// 当前 需要高亮的消息
TUIStore.watch(StoreName.CUSTOM, {
  messageHighlight: (message: typeof IMessageModel) => {
    messageHighlight.value = message;
    if (messageHighlight?.value) {
      scrollToTargetInWeb(CHAT_SCROLL_TYPE.TARGET, messageHighlight?.value);
    }
  },
});

// 事件监听
onMounted(() => {
  // 消息 messageList
  TUIStore.watch(StoreName.CHAT, {
    messageList: (list: Array<typeof IMessageModel>) => {
      allMessageList.value = list;
      messageList.value = list.filter((message) => !message.isDeleted);
      const targetIndex = messageList?.value?.findIndex(
        (item: typeof IMessageModel) => item?.ID === messageHighlight?.value?.ID
      );
      if (messageHighlight?.value || currentHighlightMessage.value) {
        scrollToTargetInWeb(CHAT_SCROLL_TYPE.TARGET, messageHighlight?.value);
      } else {
        scrollToTargetInWeb(CHAT_SCROLL_TYPE.BOTTOM);
      }
    },
    isCompleted: (flag: boolean) => {
      isCompleted.value = flag;
    },
    messageSource: (message: typeof IMessageModel) => {
      messageJumping.value = message;
    },
  });

  // 当前 ConversationID
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
    currentConversation: onCurrentConversationUpdated,
  });

  // 群未决消息列表
  TUIStore.watch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeList,
  });

  // 群未决消息数量
  TUIStore.watch(StoreName.CUSTOM, {
    groupApplicationCount: (count: number) => {
      groupApplicationCount.value = count;
    },
  });
});

// 取消监听
onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });
  // 群未决消息
  TUIStore.unwatch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeList,
  });
});

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
};

const openComplaintLink = (type: any) => {
  window.open(type.url);
};

// web & h5 上传过程中能够滚动到底部
const handleUploadingImageOrVideo = () => {
  if (messageHighlight?.value || currentHighlightMessage.value) {
    scrollToTargetInWeb(CHAT_SCROLL_TYPE.TARGET, messageHighlight?.value);
  } else {
    scrollToTargetInWeb(CHAT_SCROLL_TYPE.BOTTOM);
  }
};

// 图片预览
const handleImagePreview = (message: typeof IMessageModel) => {
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
const handleToggleMessageItem = (e: any, message: typeof IMessageModel, isLongpress = false) => {
  if (isLongpress) {
    isLongpressing.value = true;
  }
  toggleID.value = message.ID;
};

const handleToggleMessageItemForPC = (e: MouseEvent, message: typeof IMessageModel) => {
  if (isPC.value) {
    toggleID.value = message.ID;
  }
};

// h5 long press
let timer: number;
const handleH5LongPress = (e: any, message: typeof IMessageModel, type: string) => {
  if (!isH5.value) return;
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
    case "touchstart":
      touchStartHandler();
      break;
    case "touchend":
      touchEndHandler();
      setTimeout(() => {
        isLongpressing.value = false;
      }, 200);
      break;
  }
};

// 消息撤回后，编辑消息
const handleEdit = (message: typeof IMessageModel) => {
  emits("handleEditor", message, "reedit");
};

// 重发消息
const resendMessage = (message: typeof IMessageModel) => {
  reSendDialogShow.value = true;
  resendMessageData.value = message;
};

const resendMessageConfirm = () => {
  reSendDialogShow.value = !reSendDialogShow.value;
  const messageModel = resendMessageData.value;
  messageModel.resendMessage();
};

// 指定消息高亮
const highlightTargetMessage = (message: typeof IMessageModel, messageDom: HTMLElement) => {
  // 滚动到指定元素 增加闪烁特效样式
  // 对于非图片/视频类消息，即有消息气泡padding背景，高亮背景颜色
  // 对于图片/视频类消息，没有消息气泡padding背景，高亮覆盖层
  // 对于 tip 展示类型消息，高亮 tip 文字
  const targetMessageArea = messageDom?.getElementsByClassName("content")[0];
  const targetMessageTip =
    messageDom?.getElementsByClassName("message-tip")[0] ||
    messageDom?.getElementsByClassName("message-plugin-tip")[0];
  if (!targetMessageArea?.classList && !targetMessageTip?.classList) {
    return;
  }
  if (currentHighlightMessage.value) {
    const currentHighlightMessageDom = messageElementListRef?.value?.find(
      (dom: HTMLElement) => dom?.id === currentHighlightMessage.value?.ID
    );
    if (!currentHighlightMessageDom) {
      return;
    }
    const currentHighlightMessageRef =
      currentHighlightMessageDom.getElementsByClassName("content")[0] ||
      currentHighlightMessageDom.getElementsByClassName("message-tip")[0] ||
      currentHighlightMessageDom.getElementsByClassName("message-plugin-tip")[0];
    if (currentHighlightMessageRef?.classList) {
      currentHighlightMessageRef.classList.remove("content-highlight");
      currentHighlightMessageRef.classList.remove("content-highlight-noPadding");
      currentHighlightMessageRef.classList.remove("message-tip-highlight");
    }
  }
  currentHighlightMessage.value = message;
  if (targetMessageArea?.classList) {
    targetMessageArea.classList.add("content-highlight");
    targetMessageArea.classList.contains("content-noPadding") &&
      targetMessageArea.classList.add("content-highlight-noPadding");
  }
  if (targetMessageTip?.classList) {
    targetMessageTip.classList.add("message-tip-highlight");
  }
  setTimeout(() => {
    if (targetMessageArea?.classList) {
      targetMessageArea.classList.remove("content-highlight");
      targetMessageArea.classList.remove("content-highlight-noPadding");
    }
    if (targetMessageTip?.classList) {
      targetMessageTip.classList.remove("message-tip-highlight");
    }
    currentHighlightMessage.value = null;
  }, 3000);
  // 消息高亮后，清除 messageHighlight
  TUIStore.update(StoreName.CUSTOM, "messageHighlight", undefined);
};

// 回到最新消息
const jumpToLatestMessage = () => {
  TUIStore.update(StoreName.CUSTOM, "messageHighlight", undefined);
  currentHighlightMessage.value = null;
  TUIStore.update(StoreName.CHAT, "messageSource", undefined);
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
