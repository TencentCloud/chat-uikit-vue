<template>
  <div
    class="dialog-item"
    :class="!isPC ? 'dialog-item-h5' : 'dialog-item-web'"
  >
    <div
      class="dialog-item-list"
      :class="!isPC ? 'dialog-item-list-h5' : 'dialog-item-list-web'"
    >
      <template v-for="(item, index) in actionItems">
        <div
          v-if="item.renderCondition()"
          class="list-item"
          @click="getFunction(index)"
        >
          <Icon :file="item.iconUrl" width="15px" height="15px"></Icon>
          <span class="list-item-text">{{ item.text }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "../../../../adapter-vue";
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUIGlobal,
  TUITranslateService,
  type IMessageModel,
} from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import copyIcon from "../../../../assets/icon/msg-copy.svg";
import delIcon from "../../../../assets/icon/msg-del.svg";
import forwardIcon from "../../../../assets/icon/msg-forward.svg";
import revokeIcon from "../../../../assets/icon/msg-revoke.svg";
import { Toast, TOAST_TYPE } from "../../../common/Toast/index";
import { isUniFrameWork } from "../../../../utils/is-uni";

const props = defineProps({
  messageItem: {
    type: Object,
    default: () => ({}),
  },
  isShowTool: {
    type: Boolean,
    default: false,
  },
});

const isPC = TUIGlobal.getPlatform() === "pc";
const TYPES = TUIChatEngine.TYPES;
const actionItems = [
  {
    text: TUITranslateService.t("TUIChat.打开"),
    iconUrl: copyIcon,
    renderCondition() {
      if (!message.value) return false;
      return isPC && (message.value?.type === TYPES.MSG_FILE ||
        message.value?.type === TYPES.MSG_VIDEO ||
        message.value?.type === TYPES.MSG_IMAGE);
    },
    clickEvent: openMessage,
  },
  {
    text: TUITranslateService.t("TUIChat.复制"),
    iconUrl: copyIcon,
    renderCondition() {
      if (!message.value) return false;
      return isUniFrameWork && message.value?.type === TYPES.MSG_TEXT;
    },
    clickEvent: copyMessage,
  },
  {
    text: TUITranslateService.t("TUIChat.撤回"),
    iconUrl: revokeIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.flow === 'out' && message.value?.status === 'success';
    },
    clickEvent: revokeMessage,
  },
  {
    text: TUITranslateService.t("TUIChat.删除"),
    iconUrl: delIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.status === 'success';
    },
    clickEvent: deleteMessage,
  },
  {
    text: TUITranslateService.t("TUIChat.转发") || "转发",
    iconUrl: forwardIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.status === 'success';
    },
    clickEvent: forwardSingleMessage,
  },
];

const message = ref<IMessageModel>();

watchEffect(() => {
  message.value = props.messageItem as IMessageModel;
});

function getFunction(index: number) {
  // 兼容 vue2 小程序的写法 不允许动态绑定
  actionItems[index].clickEvent();
}

function openMessage() {
  let url = "";
  switch (message.value.type) {
    case TUIChatEngine.TYPES.MSG_FILE:
      url = message.value.payload.fileUrl;
      break;
    case TUIChatEngine.TYPES.MSG_VIDEO:
      url = message.value.payload.remoteVideoUrl;
      break;
    case TUIChatEngine.TYPES.MSG_IMAGE:
      url = message.value.payload.imageInfoArray[0].url;
      break;
  }
  window?.open(url, "_blank");
}

function revokeMessage() {
  // 获取 messageModel
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  let promise = messageModel.revokeMessage();
  promise.catch((error: any) => {
    // 调用异常时业务侧可以通过 promise.catch 捕获异常进行错误处理
    if ((error.code = 20016)) {
      const message = TUITranslateService.t("TUIChat.已过撤回时限");
      Toast({
        message,
        type: TOAST_TYPE.ERROR,
      });
    }
  });
}

function deleteMessage() {
  // 获取 messageModel
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  messageModel.deleteMessage();
}

function copyMessage() {
  if (isUniFrameWork) {
    TUIGlobal?.global?.setClipboardData({
      data: message.value?.payload?.text,
    });
  }
}

function forwardSingleMessage() {
  TUIStore.update(StoreName.CUSTOM, 'singleForwardMessageID', message.value.ID);
}
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.dialog-item-web {
  background: #ffffff;
  min-width: min-content;
  max-width: 220px;
  width: 72px;
  height: fit-content;
  word-break: keep-all;
  top: 30px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  white-space: nowrap;
  border: 1px solid #e0e0e0;
  padding: 12px 0;

  .dialog-item-list {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    justify-content: space-around;
    width: 100%;

    .list-item {
      padding: 4px 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      .list-item-text {
        padding-left: 4px;
        font-size: 12px;
        line-height: 17px;
      }
    }
  }
}

.dialog-item-h5 {
  @extend .dialog-item-web;
  padding: 0;
  .dialog-item-list {
    flex-wrap: nowrap;
    margin: 10px;
    .list-item {
      padding: 0 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #4f4f4f;
      .list-item-text {
        padding-left: 0;
      }
    }
  }
}
</style>
