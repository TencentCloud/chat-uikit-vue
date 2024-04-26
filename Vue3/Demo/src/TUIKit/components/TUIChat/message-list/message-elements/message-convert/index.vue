<template>
  <div
    v-if="convertVisible"
    ref="convertWrapperRef"
    :class="{
      'message-convert': true,
      'reverse': props.message.flow === 'out',
      'error': hasConvertError,
    }"
  >
    <ConvertContent
      :message="props.message"
      :contentVisible="convertVisible"
      :isSingleConvert="isSingleConvert"
      :convertWrapperRef="convertWrapperRef"
      @toggleErrorStatus="toggleErrorStatus"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from '../../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
} from '@tencentcloud/chat-uikit-engine';
import ConvertContent from './convert-content.vue';
import { IConvertInfo } from '../../../../../interface';

interface IProps {
  message: IMessageModel;
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});

const convertVisible = ref<boolean>(false);
const hasConvertError = ref<boolean>(false);
const convertWrapperRef = ref<HTMLDivElement>();

let isSingleConvert = true;

onMounted(() => {
  TUIStore.watch(StoreName.CHAT, {
    voiceToTextInfo: onMessageConvertUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    voiceToTextInfo: onMessageConvertUpdated,
  });
});

function toggleErrorStatus(hasError: boolean) {
  hasConvertError.value = hasError;
}

function onMessageConvertUpdated(info: Map<string, IConvertInfo[]>) {
  if (info === undefined) return;
  isSingleConvert = false;
  const convertInfoList = info.get(props.message.conversationID) || [];
  for (let i = 0; i < convertInfoList.length; ++i) {
    const { messageID, visible } = convertInfoList[i];
    if (messageID === props.message.ID && visible !== undefined) {
      if (convertInfoList.length === 1 && visible) {
        isSingleConvert = true;
      }
      hasConvertError.value = false;
      convertVisible.value = visible;
      break;
    }
  }
}
</script>

<style lang="scss" scoped>
.message-convert {
  margin-top: 4px;
  margin-left: 44px;
  padding: 10px;
  background-color: #f2f7ff;
  border-radius: 10px;
  display: flex;
  flex-direction: column !important;
  transition: background-color 0.15s ease-out;

  &.error {
    background-color: #ffdfdf;
  }
}

.message-convert.reverse {
  margin-right: 44px;
  margin-left: auto;
}
</style>
