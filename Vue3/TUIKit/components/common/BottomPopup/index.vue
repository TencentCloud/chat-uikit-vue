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
        isUniFrameWork && 'bottom-popup-uni',
        !isPC && 'bottom-popup-h5',
        !isPC && props.modal && 'bottom-popup-modal',
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
  // 是否展示 底部弹出对话框
  show: {
    type: Boolean,
    default: false,
  },
  // 是否需要遮罩层，默认为true
  modal: {
    type: Boolean,
    default: true,
  },
  // 弹出框内容区域高度(不包含遮罩), 默认为 fit-content
  height: {
    type: String,
    default: 'fit-content',
  },
  // 是否可以通过点击外部关闭弹出对话框, 默认为true
  // uniapp 仅支持点击蒙版关闭弹出对话框
  closeByClickOutside: {
    type: Boolean,
    default: true,
  },
  // 上边框两角圆角角度，默认为 0px，即默认为直角
  borderRadius: {
    type: String,
    default: '0px',
  },
  // title 标题文本
  title: {
    type: String,
    default: '',
  },
  // 是否展示顶部关闭按钮, 默认不展示
  showHeaderCloseButton: {
    type: Boolean,
    default: false,
  },
  // 是否展示底部提交按钮，默认不展示
  showFooterSubmitButton: {
    type: Boolean,
    default: false,
  },
  // 底部提交按钮文案，仅 showFooterSubmitButton 为 true 时有效
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
          // web h5 下生效
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
