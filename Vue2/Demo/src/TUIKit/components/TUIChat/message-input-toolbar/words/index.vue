<template>
  <ToolbarItemContainer
    ref="container"
    :iconFile="wordsIcon"
    title="常用语"
    :needBottomPopup="true"
    :iconWidth="isUniFrameWork ? '26px' : '20px'"
    :iconHeight="isUniFrameWork ? '26px' : '20px'"
    @onDialogShow="onDialogShow"
    @onDialogClose="onDialogClose"
  >
    <div :class="['words', !isPC && 'words-h5']">
      <div :class="['words-header', !isPC && 'words-h5-header']">
        <span :class="['words-header-title', !isPC && 'words-h5-header-title']">
          {{ TUITranslateService.t("Words.常用语-快捷回复工具") }}
        </span>
        <span
          v-if="!isPC"
          :class="['words-header-close', !isPC && 'words-h5-header-close']"
          @click="closeDialog"
        >
          关闭
        </span>
      </div>
      <ul :class="['words-list', !isPC && 'words-h5-list']">
        <li
          v-for="(item, index) in wordsList"
          :key="index"
          :class="['words-list-item', !isPC && 'words-h5-list-item']"
          @click="selectWord(item)"
        >
          {{ TUITranslateService.t(`Words.${item.value}`) }}
        </li>
      </ul>
    </div>
  </ToolbarItemContainer>
</template>
<script setup lang="ts">
import {
  TUITranslateService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
  TUIChatService,
} from '@tencentcloud/chat-uikit-engine';
import { ref } from '../../../../adapter-vue';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import wordsIconLight from '../../../../assets/icon/words-light.svg';
import wordsIconDark from '../../../../assets/icon/words-dark.svg';
import { wordsList } from '../../utils/wordsList';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import { isPC, isUniFrameWork } from '../../../../utils/env';
import TUIChatConfig from '../../config';

const wordsIcon = TUIChatConfig.getTheme() === 'dark' ? wordsIconDark : wordsIconLight;
const emits = defineEmits(['onDialogPopupShowOrHide']);
const currentConversation = ref<IConversationModel>();
const container = ref();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const selectWord = (item: any) => {
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID
      || currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      text: TUITranslateService.t(`Words.${item.value}`),
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  TUIChatService.sendTextMessage(options);
  // close dialog after submit evaluate
  container?.value?.toggleDialogDisplay(false);
};

const closeDialog = () => {
  container?.value?.toggleDialogDisplay(false);
};

const onDialogShow = () => {
  emits('onDialogPopupShowOrHide', true);
};

const onDialogClose = () => {
  emits('onDialogPopupShowOrHide', false);
};
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
