<template>
  <div class="tui-clear-history-message">
    <ToolbarItemContainer
      :iconFile="clearIcon"
      title="清空历史消息"
      :iconWidth="isUniFrameWork ? '32px' : '20px'"
      :iconHeight="isUniFrameWork ? '25px' : '18px'"
      :needDialog="false"
      @onIconClick="onIconClick"
    />
      <Dialog 
      :show="dialogShow"
      :isH5="!isPC"
      :center="true"
      :title="TUITranslateService.t('TUIChat.确认要清空当前的聊天记录吗？')"
      :isHeaderShow="isPC"
      footerClass="clear-history-footer"
      @submit="clearHistoryMessage()"
      @update:show="(e) => (dialogShow = e)">
      <p class="clear-history-tip">{{ TUITranslateService.t('TUIChat.清空后无法恢复') }}</p>
    </Dialog>
  </div>

</template>
<script lang="ts" setup>
import {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine-lite';
import { onMounted, onUnmounted, ref } from '../../../../adapter-vue';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import clearIconLight from '../../../../assets/icon/clear-history.svg';
import clearIconDark from '../../../../assets/icon/clear-history.svg';
import { isUniFrameWork } from '../../../../utils/env';
import TUIChatConfig from '../../config';
import AiRobotManager from '../../aiRobotManager';
import Dialog from "../../../common/Dialog";
import { isPC } from '../../../../utils/env';

const clearIcon = TUIChatConfig.getTheme() === 'dark' ? clearIconDark : clearIconLight;
const currentConversation = ref<IConversationModel>();
const dialogShow = ref(false);

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdate,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdate,
  });
});

const onCurrentConversationUpdate = (conversation: IConversationModel) => {
  currentConversation.value = conversation;
}



const onIconClick = async () => {
  dialogShow.value = true;
};

const clearHistoryMessage = async () => {
  dialogShow.value = false;
  const { conversationID } = currentConversation.value as IConversationModel;
  await AiRobotManager.sendBreakConversation(conversationID);
  TUIChatService.clearHistoryMessage(conversationID);
}

</script>
<style lang="scss">
.clear-history-tip {
  width: 100%;
  font-family: PingFang SC;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0px;
  text-align: justify;
  color: #4F586B;
}
.clear-history-footer {
  justify-content: center !important;
  .btn {
    border-radius: 16px !important;
  }
}
</style>
