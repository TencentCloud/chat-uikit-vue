<template>
  <ToolbarItemContainer
    ref="container"
    :iconFile="faceIcon"
    title="表情"
    @onIconClick="onIconClick"
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
import { isH5 } from '../../../../utils/env';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import EmojiPickerDialog from './emoji-picker-dialog.vue';

import faceIcon from '../../../../assets/icon/face.png';

const emits = defineEmits([
  'insertEmoji',
  'dialogShowInH5',
  'dialogCloseInH5',
  'currentComponentID',
  'toggleComponent',
  'sendMessage',
]);
const currentConversation = ref();
const container = ref();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const onIconClick = (dialogRef: any) => {
  if (!isH5) {
    emits('toggleComponent');
    return;
  }
  emits('dialogShowInH5', dialogRef.value);
};

const onDialogClose = (dialogRef: any) => {
  if (!isH5) {
    return;
  }
  emits('dialogCloseInH5', dialogRef.value);
};

const insertEmoji = (emojiObj) => {
  emits('insertEmoji', emojiObj);
};
const sendMessage = () => {
  emits('sendMessage');
};
const onClose = () => {
  container?.value?.toggleDialogDisplay(false);
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
