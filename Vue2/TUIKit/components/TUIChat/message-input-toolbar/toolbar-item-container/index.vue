<template>
  <div
    :class="[
      'toolbar-item-container',
      !isPC && 'toolbar-item-container-h5',
      isUniFrameWork && 'toolbar-item-container-uni',
    ]"
    ref="toolbarItemRef"
  >
    <div
      :class="[
        'toolbar-item-container-icon',
        !isPC && 'toolbar-item-container-h5-icon',
        isUniFrameWork && 'toolbar-item-container-uni-icon',
      ]"
      @click="toggleToolbarItem"
    >
      <Icon
        :file="props.iconFile"
        class="icon"
        :width="props.iconWidth"
        :height="props.iconHeight"
      ></Icon>
    </div>
    <div v-if="isUniFrameWork" :class="['toolbar-item-container-uni-title']">
      {{ props.title }}
    </div>
    <div
      :class="[
        'toolbar-item-container-dialog',
        !isPC && 'toolbar-item-container-h5-dialog',
        isUniFrameWork && 'toolbar-item-container-uni-dialog',
      ]"
      ref="dialogRef"
      v-show="showDialog"
    >
      <BottomPopup
        v-if="props.needBottomPopup && !isPC"
        :show="showDialog"
        @onClose="onPopupClose"
      >
        <slot></slot>
      </BottomPopup>
      <slot v-else></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import {
  defineProps,
  defineEmits,
  defineExpose,
  ref,
  onMounted,
  onBeforeUnmount,
  useSlots,
} from "../../../../adapter-vue";
import Icon from "../../../common/Icon.vue";
import BottomPopup from "../../../common/BottomPopup/index.vue";

const props = defineProps({
  iconFile: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  needDialog: {
    type: Boolean,
    default: true,
  },
  iconWidth: {
    type: String,
    default: "20px",
  },
  iconHeight: {
    type: String,
    default: "20px",
  },
  // 是否需要移动端底部弹窗对话框展示, 默认为false
  // pc端无效
  needBottomPopup: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["onIconClick", "onDialogClose", "onDialogShow"]);

const showDialog = ref(false);
const toolbarItemRef = ref();
const dialogRef = ref();
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== 'undefined');

const toggleToolbarItem = () => {
  emits("onIconClick", dialogRef);
  if(isPC.value){
    onClickOutside(toolbarItemRef.value);
  }
  if (!props.needDialog) {
    return;
  }
  showDialog.value = true;
  emits("onDialogShow", dialogRef);
};

// click outside
let clickOutside = false;
let clickInner = false;
const onClickOutside = (component: any) => {
  if (isUniFrameWork.value) {
    return;
  }
  document.addEventListener("click", onClickDocument);
  component?.addEventListener &&
    component?.addEventListener("click", onClickTarget);
};

const onClickDocument = () => {
  clickOutside = true;
  if (!clickInner && clickOutside) {
    showDialog.value = false;
    removeClickListener(dialogRef.value);
    emits("onDialogClose", dialogRef);
  }
  clickOutside = false;
  clickInner = false;
};

const onClickTarget = () => {
  clickInner = true;
};

const removeClickListener = (component: any) => {
  if (isUniFrameWork.value) {
    return;
  }
  document.removeEventListener("click", onClickDocument);
  component?.removeEventListener &&
    component?.removeEventListener("click", onClickTarget);
};

const toggleDialogDisplay = (showStatus: boolean) => {
  showDialog.value = showStatus;
  switch (showStatus) {
    case true:
      emits("onDialogShow", dialogRef);
      break;
    case false:
      emits("onDialogClose", dialogRef);
  }
};

const onPopupClose = () => {
  showDialog.value = false;
};

defineExpose({
  toggleDialogDisplay,
});
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
