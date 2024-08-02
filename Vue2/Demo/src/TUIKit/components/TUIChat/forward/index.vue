<template>
  <Overlay
    :visible="isShowForwardPanel"
    :useMask="false"
  >
    <Transfer
      :title="TUITranslateService.t('TUIChat.转发')"
      :isSearch="false"
      :isCustomItem="false"
      :list="customConversationList"
      :isHiddenBackIcon="isUniFrameWork"
      @cancel="closeForwardPanel"
      @submit="finishSelected"
    />
  </Overlay>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from '../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUIChatService,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import Overlay from '../../common/Overlay/index.vue';
import Transfer from '../../common/Transfer/index.vue';
import { Toast, TOAST_TYPE } from '../../../components/common/Toast';
import { isUniFrameWork } from '../../../utils/env';
import { isEnabledMessageReadReceiptGlobal } from '../utils/utils';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../offlinePushInfoManager/index';

interface IEmits {
  (e: 'toggleMultipleSelectMode', visible?: boolean): void;
}

const emits = defineEmits<IEmits>();

let selectedToForwardMessageIDList: string[] = [];
let isMergeForward = false;

const isShowForwardPanel = ref(false);
const customConversationList = ref();

onMounted(() => {
  TUIStore.watch(StoreName.CUSTOM, {
    singleForwardMessageID: onSingleForwardMessageIDUpdated,
    multipleForwardMessageID: onMultipleForwardMessageIDUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CUSTOM, {
    singleForwardMessageID: onSingleForwardMessageIDUpdated,
    multipleForwardMessageID: onMultipleForwardMessageIDUpdated,
  });

  // tuistore data must be cleared when closing the forward panel
  clearStoreData();
});

function onSingleForwardMessageIDUpdated(messageID: string | undefined) {
  if (typeof messageID !== 'undefined') {
    isMergeForward = false;
    selectedToForwardMessageIDList = [messageID];
    openForwardPanel();
  }
}

function onMultipleForwardMessageIDUpdated(params: { isMergeForward: boolean; messageIDList: string[] } | undefined) {
  if (!params) {
    return;
  }
  isMergeForward = false;
  const {
    isMergeForward: _isMergeForward,
    messageIDList: selectedMessageIDList,
  } = params || {};
  if (selectedMessageIDList?.length > 0) {
    isMergeForward = _isMergeForward;
    selectedToForwardMessageIDList = selectedMessageIDList;
    openForwardPanel();
  } else {
    Toast({
      message: TUITranslateService.t('TUIChat.未选择消息'),
      type: TOAST_TYPE.ERROR,
    });
  }
}

function clearStoreData() {
  TUIStore.update(StoreName.CUSTOM, 'singleForwardMessageID', undefined);
  TUIStore.update(StoreName.CUSTOM, 'multipleForwardMessageID', undefined);
}

function closeForwardPanel(): void {
  // tuistore data must be cleared when closing the forward panel
  clearStoreData();
  isShowForwardPanel.value = false;
}

function openForwardPanel(): void {
  getTransforRenderDataList();
  isShowForwardPanel.value = true;
}

function finishSelected(selectedConvIDWrapperList: Array<{ userID: string }>): void {
  if (selectedConvIDWrapperList?.length === 0) return;
  // to reuse Transfer, so we have to get conversationModel by userID instead of ConversationID
  const selectedConversationList = selectedConvIDWrapperList.map(IDWrapper => TUIStore.getConversationModel(IDWrapper.userID));
  const unsentMessageQueue = selectedToForwardMessageIDList
    .map(messageID => TUIStore.getMessageModel(messageID))
    .sort((a, b) => a.time - b.time);
  const forwardPromises = selectedConversationList.map((conversation) => {
    const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
      conversation,
      messageType: TUIChatEngine.TYPES.MSG_MERGER,
    };
    return TUIChatService.sendForwardMessage(
      [conversation],
      unsentMessageQueue,
      {
        needMerge: isMergeForward,
        offlinePushInfo: OfflinePushInfoManager.create(offlinePushInfoCreateParams),
        params: {
          needReadReceipt: isEnabledMessageReadReceiptGlobal(),
        },
      },
    );
  });
  Promise.allSettled(forwardPromises).then((results) => {
    for (const result of results) {
      const { status } = result;
      if (status === 'rejected') {
        const errorMessage = result.reason.code === 80001 ? TUITranslateService.t('TUIChat.内容包含敏感词汇') : result.reason.message as string;
        Toast({
          message: errorMessage,
          type: TOAST_TYPE.ERROR,
        });
        break;
      }
    }
  });
  closeForwardPanel();
  emits('toggleMultipleSelectMode', false);
}

function getTransforRenderDataList() {
  const conversationList = TUIStore.getData(StoreName.CONV, 'conversationList');
  customConversationList.value = conversationList.map((conversation) => {
    return {
      // To achieve reusability of Transfer, userID is used here instead of ConversationID
      userID: conversation.conversationID,
      nick: conversation.getShowName(),
      avatar: conversation.getAvatar(),
    };
  });
}
</script>
