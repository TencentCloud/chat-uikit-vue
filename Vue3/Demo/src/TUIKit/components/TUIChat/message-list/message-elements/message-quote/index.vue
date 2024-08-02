<template>
  <div
    v-if="hasQuoteContent"
    :class="{
      'reference-content': true,
      'reverse': message.flow === 'out',
    }"
    @click="scrollToOriginalMessage"
  >
    <div
      v-if="isMessageRevoked"
      class="revoked-text"
    >
      {{ TUITranslateService.t('TUIChat.引用内容已撤回') }}
    </div>
    <div
      v-else
      class="max-double-line"
    >
      {{ messageQuoteContent.messageSender }}: {{ transformTextWithKeysToEmojiNames(messageQuoteText) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from '../../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { getBoundingClientRect, getScrollInfo } from '@tencentcloud/universal-api';
import { isUniFrameWork } from '../../../../../utils/env';
import { Toast, TOAST_TYPE } from '../../../../../components/common/Toast/index';
import { ICloudCustomData, IQuoteContent, MessageQuoteTypeEnum } from './interface.ts';
import { transformTextWithKeysToEmojiNames } from '../../../emoji-config';

export interface IProps {
  message: IMessageModel;
}

export interface IEmits {
  (e: 'scrollTo', scrollHeight: number): void;
  (e: 'blinkMessage', messageID: string | undefined): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});

let selfAddValue = 0;
const messageQuoteText = ref<string>('');
const hasQuoteContent = ref(false);
const messageQuoteContent = ref<IQuoteContent>({} as IQuoteContent);

const isMessageRevoked = computed<boolean>(() => {
  try {
    const cloudCustomData: ICloudCustomData = JSON.parse(props.message?.cloudCustomData || '{}');
    const quotedMessageModel = TUIStore.getMessageModel(cloudCustomData.messageReply.messageID);
    return quotedMessageModel?.isRevoked;
  } catch (error) {
    return true;
  }
});

onMounted(() => {
  try {
    const cloudCustomData: ICloudCustomData = JSON.parse(props.message?.cloudCustomData || '{}');
    hasQuoteContent.value = Boolean(cloudCustomData.messageReply);
    if (hasQuoteContent.value) {
      messageQuoteContent.value = cloudCustomData.messageReply;
      messageQuoteText.value = performQuoteContent(messageQuoteContent.value);
    }
  } catch (error) {
    hasQuoteContent.value = false;
  }
});

function performQuoteContent(params: IQuoteContent) {
  let messageKey: string = '';
  let quoteContent: string = '';
  switch (params.messageType) {
    case MessageQuoteTypeEnum.TYPE_TEXT:
      messageKey = '[文本]';
      break;
    case MessageQuoteTypeEnum.TYPE_CUSTOM:
      messageKey = '[自定义消息]';
      break;
    case MessageQuoteTypeEnum.TYPE_IMAGE:
      messageKey = '[图片]';
      break;
    case MessageQuoteTypeEnum.TYPE_SOUND:
      messageKey = '[音频]';
      break;
    case MessageQuoteTypeEnum.TYPE_VIDEO:
      messageKey = '[视频]';
      break;
    case MessageQuoteTypeEnum.TYPE_FILE:
      messageKey = '[文件]';
      break;
    case MessageQuoteTypeEnum.TYPE_LOCATION:
      messageKey = '[地理位置]';
      break;
    case MessageQuoteTypeEnum.TYPE_FACE:
      messageKey = '[动画表情]';
      break;
    case MessageQuoteTypeEnum.TYPE_GROUP_TIPS:
      messageKey = '[群提示]';
      break;
    case MessageQuoteTypeEnum.TYPE_MERGER:
      messageKey = '[聊天记录]';
      break;
    default:
      messageKey = '[消息]';
      break;
  }
  if (
    [
      MessageQuoteTypeEnum.TYPE_TEXT,
      MessageQuoteTypeEnum.TYPE_MERGER,
    ].includes(params.messageType)
  ) {
    quoteContent = params.messageAbstract;
  }
  return quoteContent ? quoteContent : TUITranslateService.t(`TUIChat.${messageKey}`);
}

async function scrollToOriginalMessage() {
  if (isMessageRevoked.value) {
    return;
  }
  const originMessageID = messageQuoteContent.value?.messageID;
  const currentMessageList = TUIStore.getData(StoreName.CHAT, 'messageList');
  const isOriginalMessageInScreen = currentMessageList.some(msg => msg.ID === originMessageID);
  if (originMessageID && isOriginalMessageInScreen) {
    try {
      const scrollViewRect = await getBoundingClientRect('#messageScrollList', 'messageList');
      const originalMessageRect = await getBoundingClientRect('#tui-' + originMessageID, 'messageList');
      const { scrollTop } = await getScrollInfo('#messageScrollList', 'messageList');
      const finalScrollTop = originalMessageRect.top + scrollTop - scrollViewRect.top - (selfAddValue++ % 2);
      const isNeedScroll = originalMessageRect.top < scrollViewRect.top;
      if (!isUniFrameWork && window) {
        const scrollView = document.getElementById('messageScrollList');
        if (isNeedScroll && scrollView) {
          scrollView.scrollTop = finalScrollTop;
        }
      } else if (isUniFrameWork && isNeedScroll) {
        emits('scrollTo', finalScrollTop);
      }
      emits('blinkMessage', originMessageID);
    } catch (error) {
      console.error(error);
    }
  } else {
    Toast({
      message: TUITranslateService.t('TUIChat.无法定位到原消息'),
      type: TOAST_TYPE.WARNING,
    });
  }
}
</script>

<style lang="scss" scoped>
.reference-content {
  max-width: 272px;
  margin-top: 4px;
  margin-left: 44px;
  padding: 12px;
  font-size: 12px;
  color: #666;
  word-wrap: break-word;
  word-break: break-all;
  background-color: #fbfbfb;
  border-radius: 8px;
  line-height: 16.8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.reverse.reference-content {
    margin-right: 44px;
    margin-left: auto;
}

.revoked-text {
  color: #999;
}

.max-double-line {
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  max-height: 33px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
