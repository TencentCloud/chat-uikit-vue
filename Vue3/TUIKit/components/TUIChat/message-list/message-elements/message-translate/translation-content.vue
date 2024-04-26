<template>
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
      <template
        v-if="translationTextList.length > 0"
      >
        <span
          v-for="(text, index) in translationTextList"
          :key="index"
        >
          <img
            v-if="text.type === 'face'"
            class="text-face"
            :src="text.value"
          >
          <span
            v-else
            class="text-plain"
          >{{ text.value }}</span>
        </span>
      </template>
      <template v-else>
        {{ translationErrorText }}
      </template>
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
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from '../../../../../adapter-vue';
import {
  IMessageModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { getBoundingClientRectSync } from '@tencentcloud/universal-api';
import { TranslationTextType, translator } from '../../../utils/translation';

interface IProps {
  message: IMessageModel;
  translationContentVisible: boolean;
  isSingleTranslation: boolean;
  translationWrapperRef: HTMLDivElement | undefined;
}

interface IEmits {
  (e: 'toggleErrorStatus', status: boolean): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
});

const translationFinished = ref<boolean>(false);
const translationErrorText = ref<string>('');
const translationTextList = ref<TranslationTextType[]>([]);
const calculateHeight = ref<number>(0);
const calculateWidth = ref<number>(0);

const translationLoadingRef = ref<HTMLDivElement>();
const translationContentRef = ref<HTMLDivElement>();

watch(() => props.translationContentVisible, (newVal: boolean) => {
  if (newVal) {
    translator.get(props.message)
      .then((result) => {
        translationFinished.value = true;
        translationTextList.value = result;

        nextTick(() => {
          const { height: originHeight, width: originWidth } = getBoundingClientRectSync(translationLoadingRef.value!);
          const { height, width } = getBoundingClientRectSync(translationContentRef.value!);
          calculateHeight.value = originHeight;
          calculateWidth.value = originWidth;
          requestAnimationFrame(() => {
            calculateHeight.value = height;
            calculateWidth.value = width;
            if (props.isSingleTranslation) {
              nextTick(() => {
                const { bottom } = getBoundingClientRectSync(props.translationWrapperRef);
                const { bottom: bottomWindow } = getBoundingClientRectSync('#messageScrollList');
                if (bottom > bottomWindow) {
                  const timer = setTimeout(() => {
                    props.translationWrapperRef!.scrollIntoView({ block: 'end', behavior: 'smooth' });
                    clearTimeout(timer);
                  }, 150);
                }
              });
            }
          });
        });
      })
      .catch((err) => {
        translationFinished.value = true;
        const { height: originHeight } = getBoundingClientRectSync(translationLoadingRef.value!);
        calculateHeight.value = originHeight;
        translationTextList.value = [];
        emits('toggleErrorStatus', true);
        translationErrorText.value = err.message;
      });
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
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

    .text-face {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
