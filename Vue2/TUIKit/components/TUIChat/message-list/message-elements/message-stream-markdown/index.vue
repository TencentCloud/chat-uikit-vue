<template>
  <div class="message-stream">
    <pre
      ref="messageContentRef"
      :class="['message-marked', 'message-typewriter']"
      v-html="markedContent"
    />
    <StreamOperation
      :content="streamContent"
      :operations="operations"
      @onOperationClick="onOperationClick"
    />
  </div>
</template>
<script lang="ts" setup>
import { watch, ref, computed, onMounted, onUnmounted } from '../../../../../adapter-vue';
import { TUITranslateService, TUIReportService, IMessageModel } from '@tencentcloud/chat-uikit-engine-lite';
import { TypeWriter } from './type-writer';
import { markedWithPurify } from './marked';
import StreamOperation from './operation/index.vue';
import CopyManager from '../../../utils/copy';
import { IOperationType } from './operation/type';
import AiRobotManager from '../../../aiRobotManager';

interface IProps {
  payloadData: string;
  enableMarkdown?: boolean;
  enableStreaming?: boolean;
  enableOperation?: boolean;
  message?: IMessageModel;
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
const isFinished = ref<boolean>(false);
const prevChunksLength = ref<number>(0);
const streamContent = ref<string>('');
const markedContent = computed(() => generateMarkedContent(streamContent.value));
const isUnparsedMessage = ref<boolean>(false);
const operations = ref<IOperationType[]>([IOperationType.Break]);

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
  let renderContent = content;
  if (AiRobotManager.isThinkingMessage(props.message)) {
    return renderContent = '<span class="loader"></span>';
  }
  if (props.enableMarkdown) {
    renderContent = markedWithPurify(content);
  }
  if (!isFinished.value) {
    renderContent += '<span class="loader"></span>';
  }

  return renderContent;
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

watch(() => props.payloadData, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return;
  }

  if (props.enableMarkdown) {
    TUIReportService.reportFeature(206);
  }
  if (props.enableStreaming) {
    TUIReportService.reportFeature(207);
  }

  const { text, payloadData } = AiRobotManager.getRobotRenderContent(props.payloadData);
  const { chunks: _chunks, content: _content, errorInfo } = payloadData;
  const customChunks = _chunks || _content;
  chunks.value = text || errorInfo;

  if (!text && customChunks && payloadData.isFinished === 1) {
    isUnparsedMessage.value = typeof customChunks !== 'string' && !Array.isArray(customChunks);
    chunks.value = TUITranslateService.t('TUIChat.[机器人自定义消息]');
  }

  if (Object.keys(payloadData).includes('isFinished')) {
    isFinished.value = payloadData.isFinished === 0 ? false : true;
  } else {
    isFinished.value = true;
  }

  operations.value = !isFinished.value && !payloadData.isThinking ? [IOperationType.Break] : [];

  if (!props.enableStreaming || (newValue && !oldValue && isFinished.value)) {
    // disable typeWriter style or history message first load
    streamContent.value = chunks.value;
  } else {
    const _newChunksToAdd = chunks.value?.slice(prevChunksLength.value);
    if (_newChunksToAdd) {
      startStreaming([_newChunksToAdd]);
    }
  }

  prevChunksLength.value = chunks.value?.length;
}, {
  deep: true,
  immediate: true,
},
);

onMounted(() => {
  watch(() => isStreaming.value, (newValue, oldValue) => {
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
    CopyManager.copyTextOrHtml(codeElement?.textContent || '', 'text');
  }
}

const onOperationClick = (e: Event, key: IOperationType) => {
  if (key === IOperationType.Break) {
    AiRobotManager.sendBreakMessage(props.message as IMessageModel);
  }
};

</script>
<style lang="scss" src="./index.scss"></style>
