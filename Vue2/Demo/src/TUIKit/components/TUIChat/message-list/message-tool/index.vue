<template>
  <div
    class="dialog-item"
    :class="!isPC ? 'dialog-item-h5' : 'dialog-item-web'"
  >
    <ul
      class="dialog-item-list"
      :class="!isPC ? 'dialog-item-list-h5' : 'dialog-item-list-web'"
    >
      <li
        v-if="
          isPC &&
          (message.type === TYPES.MSG_FILE ||
            message.type === TYPES.MSG_VIDEO ||
            message.type === TYPES.MSG_IMAGE)
        "
        @click="openMessage(message)"
      >
        <Icon :file="copyIcon"></Icon>
        <span>{{ TUITranslateService.t("TUIChat.打开") }}</span>
      </li>
      <li
        v-if="isUniFrameWork && message.type === TYPES.MSG_TEXT"
        @click="messageCopy(message)"
      >
        <Icon :file="copyIcon" class="file-icon"></Icon>
        <span>{{ TUITranslateService.t("TUIChat.复制") }}</span>
      </li>
      <li
        @click="revokeMessage(message)"
        v-if="message.flow === 'out' && message.status === 'success'"
      >
        <Icon :file="revokeIcon" class="file-icon"></Icon>
        <span>{{ TUITranslateService.t("TUIChat.撤回") }}</span>
      </li>
      <li v-if="message.status === 'success'" @click="deleteMessage(message)">
        <Icon :file="delIcon" class="file-icon"></Icon>
        <span>{{ TUITranslateService.t("TUIChat.删除") }}</span>
      </li>
    </ul>
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
  watchEffect,
} from "../../../../adapter-vue";
import TUIChatEngine, {
  TUIStore,
  TUIGlobal,
  IMessageModel,
  TUITranslateService,
  TUIChatService,
} from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import copyIcon from "../../../../assets/icon/msg-copy.svg";
import delIcon from "../../../../assets/icon/msg-del.svg";
import revokeIcon from "../../../../assets/icon/msg-revoke.svg";
import { Toast, TOAST_TYPE } from "../../../common/Toast/index";

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
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== "undefined");
const isShow = ref(false);
const showToolList = ref(true);
const message = ref<typeof IMessageModel>();
const TYPES = ref(TUIChatEngine.TYPES);

watchEffect(() => {
  message.value = props.messageItem;
  isShow.value = props.isShowTool;
});

const openMessage = (item: any) => {
  let url = "";
  switch (item.type) {
    case TUIChatEngine.TYPES.MSG_FILE:
      url = item.payload.fileUrl;
      break;
    case TUIChatEngine.TYPES.MSG_VIDEO:
      url = item.payload.remoteVideoUrl;
      break;
    case TUIChatEngine.TYPES.MSG_IMAGE:
      url = item.payload.imageInfoArray[0].url;
      break;
  }
  window.open(url, "_blank");
};

const revokeMessage = (message: any) => {
  // 获取 messageModel
  const messageModel = TUIStore.getMessageModel(message.ID);
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
};

const deleteMessage = (message: any) => {
  // 获取 messageModel
  const messageModel = TUIStore.getMessageModel(message.ID);
  messageModel.deleteMessage();
};

const messageCopy = (message: any) => {
  if (isUniFrameWork.value) {
    uni.setClipboardData({
      data: message?.payload?.text,
    });
  }
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.dialog-item {
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
  &-web {
    padding: 12px 0;
  }

  &-list {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    justify-content: space-around;
    width: 100%;
    &-h5 {
      flex-wrap: nowrap;
      margin: 10px;
      li {
        padding: 0 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 8px;
        color: #4f4f4f;
      }
    }
    &-web {
      li:first-child {
        margin-top: 0;
      }

      li {
        padding: 4px 12px;
        font-size: 12px;
        line-height: 17px;
        display: flex;
        flex-direction: row;
        align-items: center;
        span {
          padding-left: 4px;
        }
      }
    }
  }
}
</style>
