<template>
  <div class="message-stream">
    <pre
      ref="messageContentRef"
      :class="['message-marked', 'message-typewriter']"
      v-html="markedContent"
    />
    <StreamOperation
      v-show="isOperationShow"
      :content="streamContent"
    />
  </div>
</template>
<script lang="ts" setup>
import { watch, ref, computed, onMounted, onUnmounted } from '../../../../../adapter-vue';
import { TUITranslateService, TUIReportService } from '@tencentcloud/chat-uikit-engine';
import { TypeWriter } from './type-writer';
import { markedWithPurify } from './marked';
import { JSONToObject } from '../../../../../utils';
import StreamOperation from './operation/index.vue';
import CopyManager from '../../../utils/copy';

interface IProps {
  payloadData: string;
  enableMarkdown?: boolean;
  enableStreaming?: boolean;
  enableOperation?: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  payloadData: () => '',
  enableMarkdown: true,
  enableStreaming: true,
  enableOperation: true,
});

const emits = defineEmits(['onStreaming']);

const messageContentRef = ref();
const isStreaming = ref<boolean>(false);
const chunks = ref<string>('');
const isFinished = ref<boolean>(true);
const prevChunksLength = ref<number>(0);
const streamContent = ref<string>('');
const markedContent = computed(() => generateMarkedContent(streamContent.value));
const isUnparsedMessage = ref<string>(false);
const isOperationShow = computed(() => {
  return props.enableOperation && isFinished.value && !isStreaming.value && !isUnparsedMessage.value;
});

const typeWriter = new TypeWriter({
  onTyping: (item: string) => {
    streamContent.value += item;
    emits('onStreaming', item, streamContent.value);
  },
  onComplete() {
    isStreaming.value = false;
  },
});

const generateMarkedContent = (content: string) => {
  if (!props.enableMarkdown) {
    return content;
  }
  if (!content && !isFinished.value) {
    return '<div class="loader"></div>';
  }
  return markedWithPurify(content);
};

function startStreaming(content: string[]) {
  if (!isStreaming.value) {
    isStreaming.value = true;
    typeWriter.add(content);
    typeWriter.start();
  } else {
    typeWriter.add(content);
  }
}

watch(() => props.payloadData,
  (newValue: string, oldValue: string) => {
    if (newValue === oldValue) {
      return;
    }

    if(props.enableMarkdown){
      TUIReportService.reportFeature(206);
    }
    if(props.enableStreaming){
      TUIReportService.reportFeature(207);
    }

    const _payloadDataObject = JSONToObject(props.payloadData);

    if (_payloadDataObject.chunks) {
      const _chunks = _payloadDataObject.chunks;
      if (typeof _chunks === 'string' || Array.isArray(_chunks)) {
        chunks.value = Array.isArray(_chunks) ? _chunks.join('') : _chunks;
      } else {
        chunks.value = TUITranslateService.t('TUIChat.[机器人自定义消息]');
        isUnparsedMessage.value = true;
      }
    } else if (_payloadDataObject.content) {
      const _content = _payloadDataObject.content;
      if (typeof _content === 'string' || Array.isArray(_content)) {
        chunks.value = Array.isArray(_content) ? _content.join('') : _content;
      } else {
        chunks.value = TUITranslateService.t('TUIChat.[机器人自定义消息]');
        isUnparsedMessage.value = true;
      }
    } else if (_payloadDataObject.text) {
      chunks.value = _payloadDataObject.text;
    } else {
      chunks.value = '';
    }

    isFinished.value = _payloadDataObject.isFinished === 0 ? false : true;

    if (!props.enableStreaming || (newValue && !oldValue && isFinished.value)) {
      // disable typeWriter style or history message first load
      streamContent.value = chunks.value;
    } else {
      const _newChunksToAdd = chunks.value?.slice(prevChunksLength.value);
      startStreaming([_newChunksToAdd]);
    }

    prevChunksLength.value = chunks.value?.length;
  }, {
    deep: true,
    immediate: true,
  },
);

onMounted(() => {
  watch(() => isStreaming.value, (newValue: boolean, oldValue: boolean) => {
    if (newValue === oldValue) {
      return;
    }
    if (!newValue && oldValue) {
      emits('onStreaming', streamContent.value, streamContent.value);
    }
    if (!newValue) {
      const codeCopyBtns = messageContentRef.value?.querySelectorAll('.message-marked_copy-btn');
      codeCopyBtns?.forEach((btn: HTMLElement) => {
        if (btn.addEventListener) {
          btn.addEventListener('click', copyCode);
        }
      });
    }
  }, {
    immediate: true,
  });
});

onUnmounted(() => {
  const codeCopyBtns = messageContentRef.value?.querySelectorAll('.message-marked_copy-btn');
  codeCopyBtns?.forEach((btn: HTMLElement) => {
    if (btn.removeEventListener) {
      btn.removeEventListener('click', copyCode);
    }
  });
});

function copyCode(event: Event) {
  const codeContainer = (event.target as HTMLElement)?.closest('.message-marked_code-container');
  const codeElement = codeContainer?.querySelector('.message-marked_code-content');
  if (codeElement) {
    CopyManager.copyTextOrHtml(codeElement.textContent, 'text');
  }
}

</script>
<style lang="scss" src="./index.scss"></style>
