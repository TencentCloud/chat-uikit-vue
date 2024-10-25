<template>
  <div
    v-if="!isAllActionItemInvalid && !messageItem.hasRiskContent"
    ref="messageToolDom"
    :class="['dialog-item', !isPC ? 'dialog-item-h5' : 'dialog-item-web']"
  >
    <slot
      v-if="featureConfig.EmojiReaction"
      name="TUIEmojiPlugin"
    />
    <div
      class="dialog-item-list"
      :class="!isPC ? 'dialog-item-list-h5' : 'dialog-item-list-web'"
    >
      <template v-for="(item, index) in actionItems">
        <div
          v-if="item.renderCondition()"
          :key="item.key"
          class="list-item"
          @click="getFunction(index)"
          @mousedown="beforeCopy(item.key)"
        >
          <Icon
            :file="item.iconUrl"
            :size="'15px'"
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
import { ref, watchEffect, computed, onMounted, onUnmounted } from '../../../../adapter-vue';
import Icon from '../../../common/Icon.vue';
import { Toast, TOAST_TYPE } from '../../../common/Toast/index';
import delIcon from '../../../../assets/icon/msg-del.svg';
import copyIcon from '../../../../assets/icon/msg-copy.svg';
import quoteIcon from '../../../../assets/icon/msg-quote.svg';
import revokeIcon from '../../../../assets/icon/msg-revoke.svg';
import forwardIcon from '../../../../assets/icon/msg-forward.svg';
import translateIcon from '../../../../assets/icon/translate.svg';
import multipleSelectIcon from '../../../../assets/icon/multiple-select.svg';
import convertText from '../../../../assets/icon/convertText_zh.svg';
import { enableSampleTaskStatus } from '../../../../utils/enableSampleTaskStatus';
import { transformTextWithKeysToEmojiNames } from '../../emoji-config';
import { isH5, isPC, isUniFrameWork } from '../../../../utils/env';
import { ITranslateInfo, IConvertInfo } from '../../../../interface';
import TUIChatConfig from '../../config';

// uni-app conditional compilation will not run the following code
// #ifndef APP || APP-PLUS || MP || H5
import CopyManager from '../../utils/copy';
// #endif

interface IProps {
  messageItem: IMessageModel;
  isMultipleSelectMode: boolean;
}

interface IEmits {
  (key: 'toggleMultipleSelectMode'): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  isMultipleSelectMode: false,
  messageItem: () => ({}) as IMessageModel,
});
const featureConfig = TUIChatConfig.getFeatureConfig();

const TYPES = TUIChatEngine.TYPES;

const actionItems = ref([
  {
    key: 'open',
    text: TUITranslateService.t('TUIChat.打开'),
    iconUrl: copyIcon,
    renderCondition() {
      if (!featureConfig.DownloadFile || !message.value) return false;
      return isPC && (message.value?.type === TYPES.MSG_FILE
        || message.value.type === TYPES.MSG_VIDEO
        || message.value.type === TYPES.MSG_IMAGE);
    },
    clickEvent: openMessage,
  },
  {
    key: 'copy',
    text: TUITranslateService.t('TUIChat.复制'),
    iconUrl: copyIcon,
    renderCondition() {
      if (!featureConfig.CopyMessage || !message.value) return false;
      return message.value.type === TYPES.MSG_TEXT;
    },
    clickEvent: copyMessage,
  },
  {
    key: 'revoke',
    text: TUITranslateService.t('TUIChat.撤回'),
    iconUrl: revokeIcon,
    renderCondition() {
      if (!featureConfig.RevokeMessage || !message.value) return false;
      return message.value.flow === 'out' && message.value.status === 'success';
    },
    clickEvent: revokeMessage,
  },
  {
    key: 'delete',
    text: TUITranslateService.t('TUIChat.删除'),
    iconUrl: delIcon,
    renderCondition() {
      if (!featureConfig.DeleteMessage || !message.value) return false;
      return message.value.status === 'success';
    },
    clickEvent: deleteMessage,
  },
  {
    key: 'forward',
    text: TUITranslateService.t('TUIChat.转发'),
    iconUrl: forwardIcon,
    renderCondition() {
      if (!featureConfig.ForwardMessage || !message.value) return false;
      return message.value.status === 'success';
    },
    clickEvent: forwardSingleMessage,
  },
  {
    key: 'quote',
    text: TUITranslateService.t('TUIChat.引用'),
    iconUrl: quoteIcon,
    renderCondition() {
      if (!featureConfig.QuoteMessage || !message.value) return false;
      const _message = TUIStore.getMessageModel(message.value.ID);
      return message.value.status === 'success' && !_message.getSignalingInfo();
    },
    clickEvent: quoteMessage,
  },
  {
    key: 'translate',
    text: TUITranslateService.t('TUIChat.翻译'),
    visible: false,
    iconUrl: translateIcon,
    renderCondition() {
      if (!featureConfig.TranslateMessage || !message.value) return false;
      return message.value.status === 'success' && message.value.type === TYPES.MSG_TEXT;
    },
    clickEvent: translateMessage,
  },
  {
    key: 'convert',
    text: TUITranslateService.t('TUIChat.转文字'),
    visible: false,
    iconUrl: convertText,
    renderCondition() {
      if (!featureConfig.VoiceToText || !message.value) return false;
      return message.value.status === 'success' && message.value.type === TYPES.MSG_AUDIO;
    },
    clickEvent: convertVoiceToText,
  },
  {
    key: 'multi-select',
    text: TUITranslateService.t('TUIChat.多选'),
    iconUrl: multipleSelectIcon,
    renderCondition() {
      if (!featureConfig.MultiSelection || !message.value) return false;
      return message.value.status === 'success';
    },
    clickEvent: multipleSelectMessage,
  },
]);

const message = ref<IMessageModel>();
const messageToolDom = ref<HTMLElement>();

onMounted(() => {
  TUIStore.watch(StoreName.CHAT, {
    translateTextInfo: onMessageTranslationInfoUpdated,
    voiceToTextInfo: onMessageConvertInfoUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    translateTextInfo: onMessageTranslationInfoUpdated,
    voiceToTextInfo: onMessageConvertInfoUpdated,
  });
});

watchEffect(() => {
  message.value = TUIStore.getMessageModel(props.messageItem.ID);
});

const isAllActionItemInvalid = computed(() => {
  for (let i = 0; i < actionItems.value.length; ++i) {
    if (actionItems.value[i].renderCondition()) {
      return false;
    }
  }
  return true;
});

function getFunction(index: number) {
  // Compatible with Vue2 and WeChat Mini Program syntax, dynamic binding is not allowed.
  actionItems.value[index].clickEvent();
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
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  messageModel
    .revokeMessage()
    .then(() => {
      enableSampleTaskStatus('revokeMessage');
    })
    .catch((error: any) => {
      // The message cannot be recalled after the time limit was reached, which is 2 minutes by default.
      if (error.code === 20016 || error.code === 10031) {
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
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  messageModel.deleteMessage();
}

async function copyMessage() {
  if (isUniFrameWork) {
    TUIGlobal?.setClipboardData({
      data: transformTextWithKeysToEmojiNames(message.value?.payload?.text),
    });
  } else {
    // uni-app conditional compilation will not run the following code
    // #ifndef APP || APP-PLUS || MP || H5
    CopyManager.copySelection(message.value?.payload?.text);
    // #endif
  }
}

function beforeCopy(key: string) {
  // only pc support copy selection or copy full message text
  // uni-app and h5 only support copy full message text
  if (key !== 'copy' || isH5) {
    return;
  }

  // uni-app conditional compilation will not run the following code
  // #ifndef APP || APP-PLUS || MP || H5
  CopyManager.saveCurrentSelection();
  // #endif
}

function forwardSingleMessage() {
  if (!message.value) return;
  TUIStore.update(StoreName.CUSTOM, 'singleForwardMessageID', message.value.ID);
}

function quoteMessage() {
  if (!message.value) return;
  message.value.quoteMessage();
}

function translateMessage() {
  const enable = TUIStore.getData(StoreName.APP, 'enabledTranslationPlugin');
  if (!enable) {
    Toast({
      message: TUITranslateService.t('TUIChat.请开通翻译功能'),
      type: TOAST_TYPE.WARNING,
    });
    return;
  }

  if (!message.value) return;
  const index = actionItems.value.findIndex(item => item.key === 'translate');
  TUIStore.update(StoreName.CHAT, 'translateTextInfo', {
    conversationID: message.value.conversationID,
    messageID: message.value.ID,
    visible: !actionItems.value[index].visible,
  });
}

function convertVoiceToText() {
  const enable = TUIStore.getData(StoreName.APP, 'enabledVoiceToText');
  if (!enable) {
    Toast({
      message: TUITranslateService.t('TUIChat.请开通语音转文字功能'),
    });
    return;
  }

  if (!message.value) return;
  const index = actionItems.value.findIndex(item => item.key === 'convert');
  TUIStore.update(StoreName.CHAT, 'voiceToTextInfo', {
    conversationID: message.value.conversationID,
    messageID: message.value.ID,
    visible: !actionItems.value[index].visible,
  });
}

function multipleSelectMessage() {
  emits('toggleMultipleSelectMode');
}

function onMessageTranslationInfoUpdated(info: Map<string, ITranslateInfo[]>) {
  if (info === undefined) return;
  const translationInfoList = info.get(props.messageItem.conversationID) || [];
  const idx = actionItems.value.findIndex(item => item.key === 'translate');
  for (let i = 0; i < translationInfoList.length; ++i) {
    const { messageID, visible } = translationInfoList[i];
    if (messageID === props.messageItem.ID) {
      actionItems.value[idx].text = TUITranslateService.t(visible ? 'TUIChat.隐藏' : 'TUIChat.翻译');
      actionItems.value[idx].visible = !!visible;
      return;
    }
  }
  actionItems.value[idx].text = TUITranslateService.t('TUIChat.翻译');
}

function onMessageConvertInfoUpdated(info: Map<string, IConvertInfo[]>) {
  if (info === undefined) return;
  const convertInfoList = info.get(props.messageItem.conversationID) || [];
  const idx = actionItems.value.findIndex(item => item.key === 'convert');
  for (let i = 0; i < convertInfoList.length; ++i) {
    const { messageID, visible } = convertInfoList[i];
    if (messageID === props.messageItem.ID) {
      actionItems.value[idx].text = TUITranslateService.t(visible ? 'TUIChat.隐藏' : 'TUIChat.转文字');
      actionItems.value[idx].visible = !!visible;
      return;
    }
  }
  actionItems.value[idx].text = TUITranslateService.t('TUIChat.转文字');
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
    max-width: 280px;

    .list-item {
      padding: 4px 12px;
      display: flex;
      flex-direction: row;
      align-items: center;

      .list-item-text {
        padding-left: 4px;
        font-size: 12px;
        line-height: 17px;
        color: #000;
      }
    }
  }
}

.dialog-item-h5 {
  @extend .dialog-item-web;

  padding: 0;

  .dialog-item-list {
    margin: 10px;
    white-space: nowrap;
    flex-wrap: wrap;
    max-width: 280px;

    .list-item {
      padding: 0 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #4f4f4f;

      .list-item-text {
        padding-left: 0;
        color: #000;
      }
    }
  }
}
</style>
