// 移动端 底部弹出对话框 组件
<template>
  <div v-if="props.show">
    <div
      :class="[
        'bottom-popup',
        isUniFrameWork && 'bottom-popup-uni',
        !isPC && 'bottom-popup-h5',
        !isPC && props.modal && 'bottom-popup-modal',
      ]"
      v-if="!isPC"
      @click="onClickModal"
    >
      <div
        v-if="!isPC"
        :class="['bottom-popup-main', !isPC && 'bottom-popup-h5-main']"
        ref="dialogRef"
        :style="{ height: props.height }"
        @click.stop
      >
        <slot></slot>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>
<script setup lang="ts">
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import { ref, watch, nextTick } from "../../../adapter-vue";
import { isUniFrameWork } from "../../../utils/is-uni";
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
    default: "fit-content",
  },
  // 是否可以通过点击外部关闭弹出对话框, 默认为true
  // uniapp 仅支持点击蒙版关闭弹出对话框
  closeByClickOutside: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["onOpen", "onClose"]);

const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const dialogRef = ref();

watch(
  () => props.show,
  (newVal: boolean, oldVal: boolean) => {
    if (newVal === oldVal) {
      return;
    }
    switch (newVal) {
      case true:
        emits("onOpen", dialogRef);
        if (!isPC) {
          nextTick(
            () => props.closeByClickOutside && onClickOutside(dialogRef.value)
          );
        }
        break;
      case false:
        emits("onClose", dialogRef);
        if (!isPC) {
          removeClickListener(dialogRef.value);
        }
        break;
    }
  }
);

// click outside
let clickOutside = false;
let clickInner = false;
const onClickOutside = (component: any) => {
  if (isUniFrameWork) {
    return;
  }
  document.addEventListener("mousedown", onClickDocument);
  component?.addEventListener &&
    component?.addEventListener("mousedown", onClickTarget);
};

const onClickDocument = () => {
  clickOutside = true;
  if (!clickInner && clickOutside) {
    emits("onClose", dialogRef);
    removeClickListener(dialogRef.value);
  }
  clickOutside = false;
  clickInner = false;
};

const onClickTarget = () => {
  clickInner = true;
};

const removeClickListener = (component: any) => {
  if (isUniFrameWork) {
    return;
  }
  document.removeEventListener("mousedown", onClickDocument);
  component?.removeEventListener &&
    component?.removeEventListener("mousedown", onClickTarget);
};

const onClickModal = () => {
  if (isUniFrameWork || isH5.value) {
    emits("onClose", dialogRef);
  }
};
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
