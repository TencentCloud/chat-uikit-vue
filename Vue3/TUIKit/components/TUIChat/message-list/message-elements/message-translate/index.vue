<template>
  <div
    v-if="translationVisible"
    ref="translationWrapperRef"
    :class="{
      'message-translation': true,
      'reverse': props.message.flow === 'out',
      'error': hasTranslationError,
    }"
  >
    <TranslationContent
      :message="props.message"
      :translationContentVisible="translationVisible"
      :translationWrapperRef="translationWrapperRef"
      :isSingleTranslation="isSingleTranslation"
      @toggleErrorStatus="toggleErrorStatus"
    />
    <div class="copyright">
      <Icon
        :file="checkIcon"
        size="13px"
      />
      <div class="copyright-text">
        {{ TUITranslateService.t('TUIChat.由IM提供翻译支持') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from '../../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import Icon from '../../../../common/Icon.vue';
import TranslationContent from './translation-content.vue';
import checkIcon from '../../../../../assets/icon/check-sm.svg';
import { ITranslateInfo } from '../../../../../interface';

interface IProps {
  message: IMessageModel;
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});

const translationVisible = ref<boolean>(false);
const hasTranslationError = ref<boolean>(false);

const translationWrapperRef = ref<HTMLDivElement>();

let isSingleTranslation = true;

onMounted(() => {
  TUIStore.watch(StoreName.CHAT, {
    translateTextInfo: onMessageTranslationUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CHAT, {
    translateTextInfo: onMessageTranslationUpdated,
  });
});

function toggleErrorStatus(hasError: boolean) {
  hasTranslationError.value = hasError;
}

function onMessageTranslationUpdated(info: Map<string, ITranslateInfo[]>) {
  if (info === undefined) return;
  isSingleTranslation = false;
  const translationInfoList = info.get(props.message.conversationID) || [];
  for (let i = 0; i < translationInfoList.length; ++i) {
    const { messageID, visible } = translationInfoList[i];
    if (messageID === props.message.ID && visible !== undefined) {
      if (translationInfoList.length === 1 && visible) {
        isSingleTranslation = true;
      }
      hasTranslationError.value = false;
      translationVisible.value = visible;
      break;
    }
  }
}
</script>

<style lang="scss" scoped>
.message-translation {
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

  .copyright {
    display: flex;
    align-items: center;
    margin-top: 10px;

    .copyright-text {
      margin-left: 2px;
      font-size: 12px;
      color: #999;
    }
  }
}

.message-translation.reverse {
  margin-right: 44px;
  margin-left: auto;
}
</style>
