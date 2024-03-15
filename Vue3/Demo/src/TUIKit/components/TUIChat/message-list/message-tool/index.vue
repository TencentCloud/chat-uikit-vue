<template>
  <div
    v-if="!isAllActionItemInvalid && !messageItem.hasRiskContent"
    ref="messageToolDom"
    :class="['dialog-item', !isPC ? 'dialog-item-h5' : 'dialog-item-web']"
  >
    <slot name="TUIEmojiPlugin" />
    <div
      class="dialog-item-list"
      :class="!isPC ? 'dialog-item-list-h5' : 'dialog-item-list-web'"
    >
      <template v-for="(item, index) in actionItems">
        <div
          v-if="item.renderCondition()"
          :key="index"
          class="list-item"
          @click="getFunction(index)"
        >
          <Icon
            :file="item.iconUrl"
            width="15px"
            height="15px"
          />
          <span class="list-item-text">{{ item.text }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IMessageModel,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { ref, watchEffect, computed } from '../../../../adapter-vue';
import { isPC, isUniFrameWork } from '../../../../utils/env';
import Icon from '../../../common/Icon.vue';
import { Toast, TOAST_TYPE } from '../../../common/Toast/index';
import delIcon from '../../../../assets/icon/msg-del.svg';
import copyIcon from '../../../../assets/icon/msg-copy.svg';
import quoteIcon from '../../../../assets/icon/msg-quote.svg';
import revokeIcon from '../../../../assets/icon/msg-revoke.svg';
import forwardIcon from '../../../../assets/icon/msg-forward.svg';
import { enableSampleTaskStatus } from '../../../../utils/enableSampleTaskStatus';
import { decodeTextMessage } from '../../utils/emojiList';
import { copyText } from '../../utils/utils';

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

const TYPES = TUIChatEngine.TYPES;
const messageToolDom = ref<HTMLElement>();
const actionItems = [
  {
    text: TUITranslateService.t('TUIChat.打开'),
    iconUrl: copyIcon,
    renderCondition() {
      if (!message.value) return false;
      return isPC && (message.value?.type === TYPES.MSG_FILE
        || message.value?.type === TYPES.MSG_VIDEO
        || message.value?.type === TYPES.MSG_IMAGE);
    },
    clickEvent: openMessage,
  },
  {
    text: TUITranslateService.t('TUIChat.复制'),
    iconUrl: copyIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.type === TYPES.MSG_TEXT;
    },
    clickEvent: copyMessage,
  },
  {
    text: TUITranslateService.t('TUIChat.撤回'),
    iconUrl: revokeIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.flow === 'out' && message.value?.status === 'success';
    },
    clickEvent: revokeMessage,
  },
  {
    text: TUITranslateService.t('TUIChat.删除'),
    iconUrl: delIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.status === 'success';
    },
    clickEvent: deleteMessage,
  },
  {
    text: TUITranslateService.t('TUIChat.转发'),
    iconUrl: forwardIcon,
    renderCondition() {
      if (!message.value) return false;
      return message.value?.status === 'success';
    },
    clickEvent: forwardSingleMessage,
  },
  {
    text: TUITranslateService.t('TUIChat.引用'),
    iconUrl: quoteIcon,
    renderCondition() {
      if (!message.value) return false;
      const _message = TUIStore.getMessageModel(message.value.ID);
      return message.value?.status === 'success' && !_message?.getSignalingInfo();
    },
    clickEvent: quoteMessage,
  },
];

const message = ref<IMessageModel>();

watchEffect(() => {
  message.value = TUIStore.getMessageModel(props.messageItem.ID);
});

const isAllActionItemInvalid = computed(() => {
  for (let i = 0; i < actionItems.length; ++i) {
    if (actionItems[i].renderCondition()) {
      return false;
    }
  }
  return true;
});

function getFunction(index: number) {
  // 兼容 vue2 小程序的写法 不允许动态绑定
  actionItems[index].clickEvent();
}

function openMessage() {
  let url = '';
  switch (message.value?.type) {
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
  window?.open(url, '_blank');
}

function revokeMessage() {
  if (!message.value) return;
  // 获取 messageModel
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  messageModel
    .revokeMessage()
    .then(() => {
      enableSampleTaskStatus('revokeMessage');
    })
    .catch((error: any) => {
    // 调用异常时业务侧可以通过 promise.catch 捕获异常进行错误处理
      if (error.code === 20016) {
        const message = TUITranslateService.t('TUIChat.已过撤回时限');
        Toast({
          message,
          type: TOAST_TYPE.ERROR,
        });
      }
    });
}

function deleteMessage() {
  if (!message.value) return;
  // 获取 messageModel
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  messageModel.deleteMessage();
}

async function copyMessage() {
  const text = decodeTextMessage(message.value?.payload?.text);
  if (isUniFrameWork) {
    TUIGlobal?.setClipboardData({
      data: text,
    });
  } else {
    copyText(text);
  }
}

function forwardSingleMessage() {
  if (!message.value) return;
  TUIStore.update(StoreName.CUSTOM, 'singleForwardMessageID', message.value.ID);
}

function quoteMessage() {
  if (!message.value) return;
  message.value.quoteMessage();
}

defineExpose({
  messageToolDom,
});
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";

.dialog-item-web {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 12px 0;

  .dialog-item-list {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    flex-wrap: wrap;
    width: 280px;

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
    justify-content: space-around;
    width: 280px;

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
