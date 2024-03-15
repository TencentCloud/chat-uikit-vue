<template>
  <div
    v-if="quoteContent"
    :class="{
      'reference-content': true,
      'reverse': message.flow === 'out',
    }"
    @click="scrollToOriginalMessage"
  >
    <div class="max-double-line">
      {{ quoteContent.messageSender }}: {{ decodeTextMessage(quoteContent.messageAbstract) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from '../../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { getBoundingClientRect, getScrollInfo } from '@tencentcloud/universal-api';
import { isUniFrameWork } from '../../../../../utils/env';
import { Toast, TOAST_TYPE } from '../../../../../components/common/Toast/index';
import type { ICloudCustomData, IQuoteContent } from './interface.ts';
import { decodeTextMessage } from '../../../utils/emojiList';

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
let messageList: IMessageModel[] = [];

TUIStore.watch(StoreName.CHAT, {
  messageList(list: IMessageModel[]) {
    messageList = list;
  },
});

const quoteContent = computed<IQuoteContent | undefined>(() => {
  try {
    const cloudCustomData: ICloudCustomData = JSON.parse(props.message?.cloudCustomData || '{}');
    return cloudCustomData.messageReply;
  } catch (error) {
    return undefined;
  }
});

async function scrollToOriginalMessage() {
  const originMessageID = quoteContent.value?.messageID;
  const isOriginalMessageInScreen = messageList.some(msg => msg.ID === originMessageID);
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

.max-double-line {
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  max-height: 33px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
