<template>
  <div class="TUIChat" :class="[!isPC ? 'TUIChat-H5' : '']">
    <div class="TUIChat-main">
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
      <ul class="TUI-message-list" ref="messageListRef" id="messageEle">
        <p
          class="message-more"
          @click="getHistoryMessageList"
          v-if="!isCompleted"
        >
          {{ TUITranslateService.t("TUIChat.查看更多") }}
        </p>
        <li
          v-for="(item, index) in messageList"
          :key="index"
          :id="item.ID"
          ref="messageAimID"
          class="message-li"
        >
          <MessageTimestamp
            :currTime="item.time"
            :prevTime="index > 0 ? messageList[index - 1].time : 0"
          ></MessageTimestamp>
          <div
            class="message-item"
            v-if="!item.isDeleted"
            @click.stop="toggleID = ''"
          >
            <MessageTip
              v-if="item.type === TYPES.MSG_GRP_TIP"
              :content="item.getMessageContent()"
            />
            <div
              v-else-if="!item.isRevoked"
              @longpress="handleToggleMessageItem($event, item, index, true)"
              @click.prevent.right="
                handleToggleMessageItem($event, item, index)
              "
              @touchstart="handleH5LongPress($event, item, index, 'touchstart')"
              @touchend="handleH5LongPress($event, item, index, 'touchend')"
              @mouseover="handleH5LongPress($event, item, index, 'touchend')"
            >
              <MessageBubble
                :messageItem="item"
                @resendMessage="resendMessage(item)"
              >
                <MessageText
                  v-if="item.type === TYPES.MSG_TEXT"
                  :content="item.getMessageContent()"
                />
                <MessageImage
                  v-if="item.type === TYPES.MSG_IMAGE"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                  :isPC="isPC"
                  @uploading="handleUploadingImageOrVideo"
                  @previewImage="handleImagePreview"
                />
                <MessageVideo
                  v-if="item.type === TYPES.MSG_VIDEO"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                  :isPC="isPC"
                  @uploading="handleUploadingImageOrVideo"
                />
                <MessageAudio
                  v-if="item.type === TYPES.MSG_AUDIO"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                />
                <MessageFile
                  v-if="item.type === TYPES.MSG_FILE"
                  :content="item.getMessageContent()"
                />
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
              ref="msgToolRef"
              :messageItem="item"
              v-if="item.ID === toggleID"
            />
          </div>
        </li>
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
      <ImagePreviewer
        v-if="showImagePreview"
        :currentImage="currentImagePreview"
        :imageList="imageMessageList"
        @close="onImagePreviewerClose"
      ></ImagePreviewer>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  getCurrentInstance,
  defineExpose,
  nextTick,
  computed,
} from "../../../adapter-vue";

import TUIChatEngine, {
  TUIGlobal,
  IMessageModel,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIChatService,
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
import Dialog from "../../common/Dialog";
import ImagePreviewer from "../../common/ImagePreviewer/index";

import { getImgLoad } from "../utils/utils";
import { CHAT_SCROLL_TYPE } from "../../../constant";

const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const messageListRef = ref();
const title = ref("TUIChat");
const messageList = ref();
const isCompleted = ref(false);
const currentConversationID = ref("");
const nextReqMessageID = ref();
const toggleID = ref("");
const TYPES = ref(TUIChatEngine.TYPES);
const isLongpressing = ref(false);

// 图片预览相关
const showImagePreview = ref(false);
const currentImagePreview = ref<IMessageModel>();
const imageMessageList = computed(() =>
  messageList?.value?.filter((item: IMessageModel) => {
    return !item.isRevoked && item.type === TYPES.value.MSG_IMAGE;
  })
);

// 消息操作气泡调整
const toggleNowRectInfo = ref();
const dialogTop = ref(30);
const listRectInfo = ref();
const listRef = ref();

// 方法传值
const msgToolRef = ref();

// 消息重发 Dialog
const reSendDialogShow = ref(false);
const resendMessageData = ref();
const emits = defineEmits(["handleEditor"]);

// web & h5 版本（非 uniapp 平台）, 滚动到目标位置(目前仅支持滚动到指定位置)
// 建议搭配 nextTick 使用
const scrollToTargetInWeb = (type: string, targetElement?: HTMLElement) => {
  switch (type) {
    case CHAT_SCROLL_TYPE.BOTTOM:
      nextTick(() => {
        messageListRef?.value?.lastElementChild?.scrollIntoView &&
          messageListRef?.value?.lastElementChild?.scrollIntoView(false);
        getImgLoad(messageListRef?.value, "message-img", async () => {
          messageListRef?.value?.lastElementChild?.scrollIntoView(false);
        });
      });
      break;
    case CHAT_SCROLL_TYPE.TARGET:
      break;
  }
};

TUIStore.watch(StoreName.CHAT, {
  messageList: (list: Array<IMessageModel>) => {
    messageList.value = list;
    // 滚动到底部，仅支持纯文本消息，仅支持 web & h5 版本
    nextTick(() => {
      scrollToTargetInWeb(CHAT_SCROLL_TYPE.BOTTOM);
    });
  },
  isCompleted: (flag: boolean) => {
    isCompleted.value = flag;
  },
});

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    currentConversationID.value = id;
  },
});

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
  nextTick(() => {
    scrollToTargetInWeb(CHAT_SCROLL_TYPE.BOTTOM);
  });
};

// 图片预览
const handleImagePreview = (message: IMessageModel) => {
  if (
    showImagePreview.value ||
    currentImagePreview.value ||
    isLongpressing.value
  ) {
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
const handleToggleMessageItem = (
  e: any,
  message: IMessageModel,
  index: number,
  isLongpress = false
) => {
  if (isLongpress) {
    isLongpressing.value = true;
  }
  toggleID.value = message.ID;
};

// h5 long press
let timer: number;
const handleH5LongPress = (
  e: any,
  message: IMessageModel,
  index: number,
  type: string
) => {
  if (!isH5.value) return;
  function longPressHandler() {
    clearTimeout(timer);
    handleToggleMessageItem(e, message, index);
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
const handleEdit = (message: IMessageModel) => {
  emits("handleEditor", message, "reedit");
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
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
