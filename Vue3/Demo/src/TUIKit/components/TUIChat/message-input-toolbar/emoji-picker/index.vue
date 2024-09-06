<template>
  <ToolbarItemContainer
    ref="container"
    :iconFile="faceIcon"
    title="表情"
    @onDialogShow="onDialogShow"
    @onDialogClose="onDialogClose"
  >
    <EmojiPickerDialog
      @insertEmoji="insertEmoji"
      @sendMessage="sendMessage"
      @onClose="onClose"
    />
  </ToolbarItemContainer>
</template>
<script lang="ts" setup>
import {
  TUIStore,
  StoreName,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { ref } from '../../../../adapter-vue';
import faceIconLight from '../../../../assets/icon/face-light.svg';
import faceIconDark from '../../../../assets/icon/face-dark.svg';
import EmojiPickerDialog from './emoji-picker-dialog.vue';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import { isH5 } from '../../../../utils/env';
import { ToolbarDisplayType } from '../../../../interface';
import TUIChatConfig from '../../config';

interface IEmits {
  (e: 'sendMessage'): void;
  (e: 'toggleComponent'): void;
  (e: 'insertEmoji', emoji: any): void;
  (e: 'dialogShowInH5', dialogRef: HTMLElement): void;
  (e: 'dialogCloseInH5', dialogRef: HTMLElement): void;
  (e: 'changeToolbarDisplayType', type: ToolbarDisplayType): void;
}

const faceIcon = TUIChatConfig.getTheme() === 'dark' ? faceIconDark : faceIconLight;
const emits = defineEmits<IEmits>();
const currentConversation = ref();
const container = ref<InstanceType<typeof ToolbarItemContainer>>();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const onDialogShow = (dialogRef: any) => {
  if (!isH5) {
    return;
  }
  emits('changeToolbarDisplayType', 'emojiPicker');
  emits('dialogShowInH5', dialogRef.value);
};

const onDialogClose = (dialogRef: any) => {
  if (!isH5) {
    return;
  }
  emits('changeToolbarDisplayType', 'none');
  emits('dialogCloseInH5', dialogRef.value);
};

const insertEmoji = (emojiObj) => {
  emits('insertEmoji', emojiObj);
};
const sendMessage = () => {
  emits('sendMessage');
};
const onClose = () => {
  container.value?.toggleDialogDisplay(false);
};

defineExpose({
  closeEmojiPicker: onClose,
});
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
