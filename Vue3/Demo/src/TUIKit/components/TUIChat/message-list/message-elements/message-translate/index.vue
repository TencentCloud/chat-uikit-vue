<template>
  <div
    v-if="translationVisible"
    ref="translationWrapperRef"
    :class="{
      'message-translation': true,
      'reverse': props.message.flow === 'out',
      'error': translationError,
    }"
  >
    <div
      class="message-translation-container"
      :style="{
        height: calculateHeight > 0 ? `${calculateHeight}px` : 'auto',
        width: calculateWidth > 0 ? `${calculateWidth}px` : 'auto',
      }"
    >
      <div
        v-if="translationFinished"
        ref="translationContentRef"
        :class="{
          'translation-content': true,
          'occur': calculateHeight > 0,
        }"
      >
        {{ translationText }}
      </div>
      <div
        ref="translationLoadingRef"
        :class="{
          'loading': true,
          'loading-end': translationFinished
        }"
      >
        {{ TUITranslateService.t('TUIChat.翻译中') }}...
      </div>
    </div>
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
import { ref, watch, onMounted, onUnmounted, nextTick } from '../../../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { getBoundingClientRectSync } from '@tencentcloud/universal-api';
import Icon from '../../../../common/Icon.vue';
import checkIcon from '../../../../../assets/icon/check-sm.svg';
import { ITranslateInfo } from '../../../../../interface';
import { Translator } from '../../../utils/translation';

interface IProps {
  message: IMessageModel;
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});

const translationVisible = ref<boolean>(false);
const translationFinished = ref<boolean>(false);
const translationError = ref<boolean>(false);
const translationText = ref<string>('');
const calculateHeight = ref<number>(0);
const calculateWidth = ref<number>(0);

const translationLoadingRef = ref<HTMLDivElement>();
const translationWrapperRef = ref<HTMLDivElement>();
const translationContentRef = ref<HTMLDivElement>();

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
      translationVisible.value = visible;
      break;
    }
  }
}

watch(translationVisible, (newVal: boolean) => {
  if (newVal) {
    Translator.get(props.message)
      .then((text) => {
        translationFinished.value = true;
        translationText.value = text;
        nextTick(() => {
          const { height: originHeight, width: originWidth } = getBoundingClientRectSync(translationLoadingRef.value!);
          const { height, width } = getBoundingClientRectSync(translationContentRef.value!);
          calculateHeight.value = originHeight;
          calculateWidth.value = originWidth;
          requestAnimationFrame(() => {
            calculateHeight.value = height;
            calculateWidth.value = width;
            if (isSingleTranslation) {
              nextTick(() => {
                const { bottom } = getBoundingClientRectSync(translationWrapperRef.value!);
                const { bottom: bottomWindow } = getBoundingClientRectSync('#messageScrollList');
                if (bottom > bottomWindow) {
                  setTimeout(() => {
                    translationWrapperRef.value!.scrollIntoView({ block: 'end', behavior: 'smooth' });
                  }, 150);
                }
              });
            }
          });
        });
      })
      .catch((err) => {
        translationFinished.value = true;
        translationError.value = true;
        const { height: originHeight } = getBoundingClientRectSync(translationLoadingRef.value!);
        calculateHeight.value = originHeight;
        translationText.value = err.message;
      });
  } else {
    translationFinished.value = false;
    translationError.value = false;
    translationText.value = '';
    calculateHeight.value = 0;
    calculateWidth.value = 0;
  }
});
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

  .message-translation-container {
    min-height: 16px;
    min-width: 80px;
    position: relative;
    transition: width 0.15s ease-out, height 0.15s ease-out, ;
    font-size: 14px;

    .loading {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 1;
      transition: opacity 0.3s ease-out;

      &.loading-end {
        opacity: 0;
      }
    }

    .translation-content {
      opacity: 0;

      &.occur {
        animation: occur 0.3s ease-out 0.45s forwards;

        @keyframes occur {
          100% {
            opacity: 1;
          }
        }
      }
    }
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
