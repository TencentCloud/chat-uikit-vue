<template>
  <div
    ref="toolbarItemRef"
    :class="[
      'toolbar-item-container',
      !isPC && 'toolbar-item-container-h5',
      isUniFrameWork && 'toolbar-item-container-uni',
    ]"
  >
    <div
      :class="[
        'toolbar-item-container-icon',
        isUniFrameWork && 'toolbar-item-container-uni-icon',
      ]"
      @click="toggleToolbarItem"
    >
      <Icon
        :file="props.iconFile"
        class="icon"
        :width="props.iconWidth"
        :height="props.iconHeight"
      />
    </div>
    <div
      v-if="isUniFrameWork"
      :class="['toolbar-item-container-uni-title']"
    >
      {{ props.title }}
    </div>
    <div
      v-show="showDialog"
      ref="dialogRef"
      :class="[
        'toolbar-item-container-dialog',
        isDark && 'toolbar-item-container-dialog-dark',
        !isPC && 'toolbar-item-container-h5-dialog',
        isUniFrameWork && 'toolbar-item-container-uni-dialog',
      ]"
    >
      <BottomPopup
        v-if="props.needBottomPopup && !isPC"
        class="toolbar-bottom-popup"
        :show="showDialog"
        @touchmove.stop.prevent
        @onClose="onPopupClose"
      >
        <slot />
      </BottomPopup>
      <slot v-else />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from '../../../../adapter-vue';
import { outsideClick } from '@tencentcloud/universal-api';
import Icon from '../../../common/Icon.vue';
import BottomPopup from '../../../common/BottomPopup/index.vue';
import { isPC, isUniFrameWork } from '../../../../utils/env';
import TUIChatConfig from '../../config';

const props = defineProps({
  iconFile: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  needDialog: {
    type: Boolean,
    default: true,
  },
  iconWidth: {
    type: String,
    default: '20px',
  },
  iconHeight: {
    type: String,
    default: '20px',
  },
  // Whether to display the bottom popup dialog on mobile devices
  // Invalid on PC
  needBottomPopup: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['onIconClick', 'onDialogClose', 'onDialogShow']);

const isDark = ref(TUIChatConfig.getTheme() === 'dark');
const showDialog = ref(false);
const toolbarItemRef = ref();
const dialogRef = ref();

const toggleToolbarItem = () => {
  emits('onIconClick', dialogRef);
  if (isPC) {
    outsideClick.listen({
      domRefs: toolbarItemRef.value,
      handler: closeToolbarItem,
    });
  }
  if (!props.needDialog) {
    return;
  }
  toggleDialogDisplay(!showDialog.value);
};

const closeToolbarItem = () => {
  showDialog.value = false;
  emits('onDialogClose', dialogRef);
};

const toggleDialogDisplay = (showStatus: boolean) => {
  if (showDialog.value === showStatus) {
    return;
  }
  showDialog.value = showStatus;
  switch (showStatus) {
    case true:
      emits('onDialogShow', dialogRef);
      break;
    case false:
      emits('onDialogClose', dialogRef);
  }
};

const onPopupClose = () => {
  showDialog.value = false;
};

defineExpose({
  toggleDialogDisplay,
});
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
