<template>
  <div
    ref="emojiPickerDialog"
    :class="{
      'emoji-picker': true,
      'emoji-picker-h5': !isPC
    }"
  >
    <ul
      ref="emojiPickerListRef"
      :class="['emoji-picker-list', !isPC && 'emoji-picker-h5-list']"
    >
      <li
        v-for="(childrenItem, childrenIndex) in currentEmojiList"
        :key="childrenIndex"
        class="emoji-picker-list-item"
        @click="select(childrenItem, childrenIndex)"
      >
        <img
          v-if="currentTabItem.type === EMOJI_TYPE.BASIC"
          class="emoji"
          :src="currentTabItem.url + BASIC_EMOJI_URL_MAPPING[childrenItem]"
        >
        <img
          v-else-if="currentTabItem.type === EMOJI_TYPE.BIG"
          class="emoji-big"
          :src="currentTabItem.url + childrenItem + '@2x.png'"
        >
        <img
          v-else
          class="emoji-custom emoji-big"
          :src="currentTabItem.url + childrenItem"
        >
      </li>
    </ul>
    <ul class="emoji-picker-tab">
      <li
        v-for="(item, index) in list"
        :key="index"
        class="emoji-picker-tab-item"
        @click="toggleEmojiTab(index)"
      >
        <Icon
          v-if="item.type === EMOJI_TYPE.BASIC"
          class="icon"
          :file="faceIcon"
        />
        <img
          v-else-if="item.type === EMOJI_TYPE.BIG"
          class="icon-big"
          :src="item.url + item.list[0] + '@2x.png'"
        >
        <img
          v-else
          class="icon-custom icon-big"
          :src="item.url + item.list[0]"
        >
      </li>
      <li
        v-if="isUniFrameWork"
        class="send-btn"
        @click="sendMessage"
      >
        发送
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from '../../../../adapter-vue';
import {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
} from '@tencentcloud/chat-uikit-engine';
import Icon from '../../../common/Icon.vue';
import faceIconLight from '../../../../assets/icon/face-light.svg';
import faceIconDark from '../../../../assets/icon/face-dark.svg';
import { EMOJI_TYPE } from '.././../../../constant';
import { isPC, isUniFrameWork } from '../../../../utils/env';
import { IEmojiGroupList, IEmojiGroup } from '../../../../interface';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import { EMOJI_GROUP_LIST, BASIC_EMOJI_URL_MAPPING, convertKeyToEmojiName } from '../../emoji-config';
import TUIChatConfig from '../../config';

const faceIcon = TUIChatConfig.getTheme() === 'dark' ? faceIconDark : faceIconLight;
const emits = defineEmits(['insertEmoji', 'onClose', 'sendMessage']);
const currentTabIndex = ref<number>(0);
const currentConversation = ref();
const emojiPickerDialog = ref();
const emojiPickerListRef = ref();
const featureConfig = TUIChatConfig.getFeatureConfig();
const list = ref<IEmojiGroupList>(initEmojiList());
const currentTabItem = ref<IEmojiGroup>(list?.value[0]);
const currentEmojiList = ref<string[]>(list?.value[0]?.list);

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

const toggleEmojiTab = (index: number) => {
  currentTabIndex.value = index;
  currentTabItem.value = list?.value[index];
  currentEmojiList.value = list?.value[index]?.list;
  // web & h5 side scroll to top
  if (!isUniFrameWork) {
    emojiPickerListRef?.value && (emojiPickerListRef.value.scrollTop = 0);
  }
};

const select = (item: any, index: number) => {
  const options: any = {
    emoji: { key: item, name: convertKeyToEmojiName(item) },
    type: currentTabItem?.value?.type,
  };
  switch (currentTabItem?.value?.type) {
    case EMOJI_TYPE.BASIC:
      options.url = currentTabItem?.value?.url + BASIC_EMOJI_URL_MAPPING[item];
      if (isUniFrameWork) {
        uni.$emit('insert-emoji', options);
      } else {
        emits('insertEmoji', options);
      }
      break;
    case EMOJI_TYPE.BIG:
      sendFaceMessage(index, currentTabItem.value);
      break;
    case EMOJI_TYPE.CUSTOM:
      sendFaceMessage(index, currentTabItem.value);
      break;
    default:
      break;
  }
  isPC && emits('onClose');
};

const sendFaceMessage = (index: number, listItem: IEmojiGroup) => {
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID
      || currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      index: listItem.emojiGroupID,
      data: listItem.list[index],
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  TUIChatService.sendFaceMessage(options);
};

function sendMessage() {
  uni.$emit('send-message-in-emoji-picker');
}

function onCurrentConversationUpdate(conversation: IConversationModel) {
  currentConversation.value = conversation;
}

function initEmojiList() {
  return EMOJI_GROUP_LIST.filter((item) => {
    if (item.type === EMOJI_TYPE.BASIC) {
      return featureConfig.InputEmoji;
    }
    if (item.type === EMOJI_TYPE.BIG) {
      return featureConfig.InputStickers;
    }
    if (item.type === EMOJI_TYPE.CUSTOM) {
      return featureConfig.InputStickers;
    }
  });
}
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
