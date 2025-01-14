<template>
  <div :class="['message-text-container', isPC && 'text-select']">
    <span
      v-for="(item, index) in processedContent"
      :key="index"
    >
      <span
        v-if="item.name === 'text'"
        class="text"
      >
        {{ item.text }}
      </span>
      <span
        v-else-if="item.name === 'url'"
        class="url-link"
        @click="navigateToUrl(item.url)"
      >
        {{ item.text }}
      </span>
      <img
        v-else
        class="emoji"
        :src="item.src"
        :alt="item.emojiKey"
      >
    </span>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref } from '../../../../adapter-vue';
import { TUIStore, IMessageModel, TUIReportService } from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal, parseTextAndValidateUrls } from '@tencentcloud/universal-api';
import { CUSTOM_BASIC_EMOJI_URL, CUSTOM_BASIC_EMOJI_URL_MAPPING } from '../../emoji-config';
import { isPC, isUniFrameWork } from '../../../../utils/env';

interface IProps {
  content: Record<string, any>;
  messageItem: IMessageModel;
  enableURLHighlight?: boolean;
}

interface TextItem {
  name: string;
  text: string;
  src?: string;
  type?: string;
  emojiKey?: string;
  url?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  content: () => ({}),
  messageItem: () => ({} as IMessageModel),
  enableURLHighlight: false,
});

const processedContent = ref<TextItem>([]);

watch(
  () => props.messageItem,
  (newValue: IMessageModel, oldValue: IMessageModel) => {
    if (newValue?.ID === oldValue?.ID) {
      return;
    }

    if(props.enableURLHighlight){
      TUIReportService.reportFeature(208);
    }

    if(props.messageItem.getMessageContent){
      processedContent.value =  props.messageItem.getMessageContent()?.text;
    } else {
      processedContent.value = TUIStore.getMessageModel(props.messageItem.ID)?.getMessageContent()?.text;
    }
    processedContent.value = processedContent.value || props.content?.text;

    if (!processedContent.value?.length) {
      processedContent.value = [];
      return;
    }

    processedContent.value = processedContent.value.map((item: TextItem) => {
      // handle custom emoji
      if (item.name === 'img' && item?.type === 'custom') {
        if (!CUSTOM_BASIC_EMOJI_URL) {
          console.warn('CUSTOM_BASIC_EMOJI_URL is required for custom emoji.');
          return item;
        }
        if (!item.emojiKey || !CUSTOM_BASIC_EMOJI_URL_MAPPING[item.emojiKey]) {
          console.warn('emojiKey is required for custom emoji.');
          return item;
        }
        return {
          ...item,
          src: CUSTOM_BASIC_EMOJI_URL + CUSTOM_BASIC_EMOJI_URL_MAPPING[item.emojiKey]
        };
      }

      // handle url
      if (props.enableURLHighlight && item.name === 'text' && item.text) {
        if(!parseTextAndValidateUrls){
          console.warn('parseTextAndValidateUrls not found. Please update @tencentcloud/universal-api to 2.3.7 or higher.');
          return item;
        }
        const segments = parseTextAndValidateUrls(item.text);
        if (segments.length) {
          return segments.map((segment)=>({
            name: segment.type,
            text: segment.text,
            url: segment.url,
          }));
        }
      }

      return item;
    })?.flat();
  },
  {
    deep: true,
    immediate: true,
  }
);

// Function to handle navigation
function navigateToUrl(url: string) {
  if (url) {
    if (isUniFrameWork) {
      // Use UniApp navigation
      TUIGlobal.navigateTo({
        url: `/pages/views/webview?url=${url}` // Assuming you have a webview page to handle external URLs
      });
    } else {
      // Use standard browser navigation
      TUIGlobal.open(url, '_blank');
    }
  }
}
</script>

<style lang="scss" scoped>
.message-text-container {
  display: inline;
  font-size: 0;
  letter-spacing: -1px;
}

.text-select {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

.text,.emoji,.url-link{
  &::selection {
    background-color: #b4d5fe;
    color: inherit;
    cursor: text;
  }
}

.emoji {
  font-size: 0;
  vertical-align: bottom;
  width: 20px;
  height: 20px;
}

.text, .url-link {
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
  letter-spacing: normal;
}

.url-link {
  color: #0366d6;
  text-decoration: none;
  word-break: break-all;
  cursor: text;

  &:hover:not(:active) {
    cursor: pointer;
  }

  &:visited {
    color: #0366d6;
  }
}
</style>
