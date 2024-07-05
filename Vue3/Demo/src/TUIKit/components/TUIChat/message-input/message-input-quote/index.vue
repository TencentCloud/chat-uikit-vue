<template>
  <div
    v-if="Boolean(quoteMessage) && props.displayType !== 'audio'"
    :class="{
      'input-quote-container': true,
      'input-quote-container-uni': isUniFrameWork,
      'input-quote-container-h5': isH5,
    }"
  >
    <div class="input-quote-content">
      <div class="max-one-line">
        {{ quoteMessage.nick || quoteMessage.from }}: {{ quoteContentText }}
      </div>
      <Icon
        class="input-quote-close-icon"
        :file="closeIcon"
        width="11px"
        height="11px"
        @onClick="cancelQuote"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from '../../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IMessageModel,
} from '@tencentcloud/chat-uikit-engine';
import Icon from '../../../common/Icon.vue';
import closeIcon from '../../../../assets/icon/icon-close.svg';
import { isH5, isUniFrameWork } from '../../../../utils/env';
import { transformTextWithKeysToEmojiNames } from '../../emoji-config';
import { InputDisplayType } from '../../../../interface';

interface IProps {
  displayType?: InputDisplayType;
}

const props = withDefaults(defineProps<IProps>(), {
  displayType: 'editor',
});

const TYPES = TUIChatEngine.TYPES;
const quoteMessage = ref<IMessageModel>();

onMounted(() => {
  TUIStore.watch(StoreName.CHAT, {
    quoteMessage: onQuoteMessageUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    quoteMessage: onQuoteMessageUpdated,
  });
});

const quoteContentText = computed(() => {
  let _quoteContentText;
  switch (quoteMessage.value?.type) {
    case TYPES.MSG_TEXT:
      _quoteContentText = transformTextWithKeysToEmojiNames(quoteMessage.value.payload?.text);
      break;
    case TYPES.MSG_IMAGE:
      _quoteContentText = TUITranslateService.t('TUIChat.图片');
      break;
    case TYPES.MSG_AUDIO:
      _quoteContentText = TUITranslateService.t('TUIChat.语音');
      break;
    case TYPES.MSG_VIDEO:
      _quoteContentText = TUITranslateService.t('TUIChat.视频');
      break;
    case TYPES.MSG_FILE:
      _quoteContentText = TUITranslateService.t('TUIChat.文件');
      break;
    case TYPES.MSG_CUSTOM:
      _quoteContentText = TUITranslateService.t('TUIChat.自定义');
      break;
    case TYPES.MSG_FACE:
      _quoteContentText = TUITranslateService.t('TUIChat.表情');
      break;
    case TYPES.MSG_MERGER:
      _quoteContentText = TUITranslateService.t('TUIChat.聊天记录');
      break;
    default:
      _quoteContentText = TUITranslateService.t('TUIChat.消息');
      break;
  }
  return _quoteContentText;
});

function cancelQuote() {
  TUIStore.update(StoreName.CHAT, 'quoteMessage', { message: undefined, type: 'quote' });
}

function onQuoteMessageUpdated(options?: { message: IMessageModel; type: string }) {
  if (options?.message && options?.type === 'quote') {
    quoteMessage.value = options.message;
  } else {
    quoteMessage.value = undefined;
  }
}
</script>

<style lang="scss" scoped>
%common-container-style {
  margin: 5px 100px 5px 8px;
  display: flex;
  flex: 0 1 auto;

  .input-quote-content {
    display: flex;
    flex: 0 1 auto;
    background-color: #fafafa;
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    align-items: center;
    line-height: 16px;
    max-width: 100%;
    box-sizing: border-box;
    min-width: 0;

    .max-one-line {
      flex: 0 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .input-quote-close-icon {
    margin-left: 5px;
    padding: 5px;
  }
}

.input-quote-container {
  @extend %common-container-style;
}

.input-quote-container-uni {
  @extend %common-container-style;

  margin: 5px 60px 0 30px;
}

.input-quote-container-h5 {
  @extend %common-container-style;

  margin: 5px 0 0;
}
</style>
