<template>
  <ToolbarItemContainer
    :iconFile="fileIcon"
    title="文件"
    :iconWidth="isUniFrameWork ? '32px' : '20px'"
    :iconHeight="isUniFrameWork ? '25px' : '18px'"
    :needDialog="false"
    @onIconClick="onIconClick"
  >
    <div :class="['file-upload', !isPC && 'file-upload-h5']">
      <input
        ref="inputRef"
        title="文件"
        type="file"
        data-type="file"
        accept="*"
        @change="sendFileMessage"
      >
    </div>
  </ToolbarItemContainer>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
  SendMessageOptions,
} from '@tencentcloud/chat-uikit-engine';
import { ref } from '../../../../adapter-vue';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import fileIconLight from '../../../../assets/icon/file-light.svg';
import fileIconDark from '../../../../assets/icon/file-dark.svg';
import { isPC, isUniFrameWork } from '../../../../utils/env';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../../offlinePushInfoManager/index';
import TUIChatConfig from '../../config';

const fileIcon = TUIChatConfig.getTheme() === 'dark' ? fileIconDark : fileIconLight;
const inputRef = ref();
const currentConversation = ref<IConversationModel>();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const onIconClick = () => {
  if (isUniFrameWork) {
    return;
  } else {
    inputRef?.value?.click && inputRef?.value?.click();
  }
};

const sendFileMessage = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID
      || currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file: e?.target,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
    conversation: currentConversation.value,
    payload: options.payload,
    messageType: TUIChatEngine.TYPES.MSG_FILE,
  };
  const sendMessageOptions: SendMessageOptions = {
    offlinePushInfo: OfflinePushInfoManager.create(offlinePushInfoCreateParams),
  };
  TUIChatService.sendFileMessage(options, sendMessageOptions);
  e.target.value = '';
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common";
</style>
