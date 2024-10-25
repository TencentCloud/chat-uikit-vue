<!--
  移动端 底部弹出对话框 组件
  - pc 端，仅展示【插槽】内容，无弹出对话框，无对话框相关 header footer
  - mobile 端，底部弹出对话框，支持 对话框相关 header footer 定制展示，详情请参见参数列表
-->
<template>
  <div v-if="props.show">
    <div
      v-if="!isPC"
      :class="[
        'bottom-popup',
        !isPC && 'bottom-popup-h5',
        !isPC && props.modal && 'bottom-popup-modal',
        isUniFrameWork && 'bottom-popup-uni',
      ]"
      @click="closeBottomPopup"
    >
      <div
        ref="dialogRef"
        :class="['bottom-popup-main', !isPC && 'bottom-popup-h5-main']"
        :style="{
          height: props.height,
          borderTopLeftRadius: props.borderRadius,
          borderTopRightRadius: props.borderRadius,
        }"
        @click.stop
      >
        <div
          v-if="title || showHeaderCloseButton"
          class="header"
        >
          <div
            v-if="title"
            class="header-title"
          >
            {{ title }}
          </div>
          <div
            v-if="showHeaderCloseButton"
            class="header-close"
            @click="closeBottomPopup"
          >
            {{ TUITranslateService.t("关闭") }}
          </div>
        </div>
        <slot />
        <div
          v-if="showFooterSubmitButton"
          class="footer"
        >
          <div
            class="footer-submit"
            @click="submit"
          >
            {{ submitButtonContent }}
          </div>
        </div>
      </div>
    </div>
    <slot v-else />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, nextTick } from '../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { outsideClick } from '@tencentcloud/universal-api';
import { isPC, isH5, isUniFrameWork } from '../../../utils/env';

const props = defineProps({
  // Whether to display the bottom pop-up dialog box
  show: {
    type: Boolean,
    default: false,
  },
  // Whether a mask layer is required, the default is true
  modal: {
    type: Boolean,
    default: true,
  },
  // Popup box content area height (excluding mask), default is fit-content
  height: {
    type: String,
    default: 'fit-content',
  },
  // Whether the pop-up dialog box can be closed by clicking outside, the default is true
  // uniapp only supports closing the pop-up dialog box by clicking the mask
  closeByClickOutside: {
    type: Boolean,
    default: true,
  },
  // The rounded angle of the top border corners is 0px by default, i.e. right angle by default
  borderRadius: {
    type: String,
    default: '0px',
  },
  title: {
    type: String,
    default: '',
  },
  // Whether to display the top close button, not displayed by default
  showHeaderCloseButton: {
    type: Boolean,
    default: false,
  },
  // Whether to display the submit button at the bottom, not displayed by default
  showFooterSubmitButton: {
    type: Boolean,
    default: false,
  },
  // Bottom submit button text, only valid when showFooterSubmitButton is true
  submitButtonContent: {
    type: String,
    default: () => TUITranslateService.t('确定'),
  },
});

const emits = defineEmits(['onOpen', 'onClose', 'onSubmit']);
const dialogRef = ref();

watch(
  () => props.show,
  (newVal: boolean, oldVal: boolean) => {
    if (newVal === oldVal) {
      return;
    }
    switch (newVal) {
      case true:
        emits('onOpen', dialogRef);
        nextTick(() => {
          // Effective under web h5
          if (isH5 && !isUniFrameWork) {
            if (props.closeByClickOutside) {
              outsideClick.listen({
                domRefs: dialogRef.value,
                handler: closeBottomPopup,
              });
            }
          }
        });
        break;
      case false:
        emits('onClose', dialogRef);
        break;
    }
  },
);

const closeBottomPopup = () => {
  if (isUniFrameWork || isH5) {
    emits('onClose', dialogRef);
  }
};

const submit = () => {
  emits('onSubmit');
  closeBottomPopup();
};
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
