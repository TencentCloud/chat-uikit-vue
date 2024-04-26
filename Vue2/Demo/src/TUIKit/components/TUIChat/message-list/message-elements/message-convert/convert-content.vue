<template>
  <div
    class="message-convert-container"
    :style="{
      height: calculateHeight > 0 ? `${calculateHeight}px` : 'auto',
      width: calculateWidth > 0 ? `${calculateWidth}px` : 'auto',
    }"
  >
    <div
      v-if="convertFinished"
      ref="convertContentRef"
      :class="{
        'convert-content': true,
        'occur': calculateHeight > 0,
      }"
    >
      {{ convertText }}
    </div>
    <div
      ref="convertLoadingRef"
      :class="{
        'loading': true,
        'loading-end': convertFinished
      }"
    >
      {{ TUITranslateService.t('TUIChat.转换中') }}...
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
import { convertor } from '../../../utils/convertVoiceToText';

interface IProps {
  message: IMessageModel;
  contentVisible: boolean;
  convertWrapperRef: HTMLDivElement | undefined;
  isSingleConvert?: boolean;
}

interface IEmits {
  (e: 'toggleErrorStatus', status: boolean): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
  isSingleConvert: false,
});

const convertFinished = ref<boolean>(false);
const convertText = ref<string>('');
const calculateHeight = ref<number>(0);
const calculateWidth = ref<number>(0);

const convertLoadingRef = ref<HTMLDivElement>();
const convertContentRef = ref<HTMLDivElement>();

watch(() => props.contentVisible, (newVal: boolean) => {
  if (newVal) {
    convertor.get(props.message)
      .then((text) => {
        convertFinished.value = true;
        convertText.value = text;
        nextTick(() => {
          const { height: originHeight, width: originWidth } = getBoundingClientRectSync(convertLoadingRef.value!);
          const { height, width } = getBoundingClientRectSync(convertContentRef.value!);
          calculateHeight.value = originHeight;
          calculateWidth.value = originWidth;
          requestAnimationFrame(() => {
            calculateHeight.value = height;
            calculateWidth.value = width;
            if (props.isSingleConvert) {
              nextTick(() => {
                const { bottom } = getBoundingClientRectSync(props.convertWrapperRef);
                const { bottom: bottomWindow } = getBoundingClientRectSync('#messageScrollList');
                if (bottom > bottomWindow) {
                  const timer = setTimeout(() => {
                    props.convertWrapperRef!.scrollIntoView({ block: 'end', behavior: 'smooth' });
                    clearTimeout(timer);
                  }, 150);
                }
              });
            }
          });
        });
      })
      .catch((err) => {
        convertFinished.value = true;
        emits('toggleErrorStatus', true);
        const { height: originHeight } = getBoundingClientRectSync(convertLoadingRef.value!);
        calculateHeight.value = originHeight;
        convertText.value = err.message;
      });
  }
}, {
  immediate: true,
});
</script>

<style lang="scss" scoped>
.message-convert-container {
  min-height: 20px;
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

  .convert-content {
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
</style>
