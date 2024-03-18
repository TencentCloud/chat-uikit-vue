<template>
  <div
    :class="[
      'message-input-toolbar',
      !isPC && 'message-input-toolbar-h5',
      isUniFrameWork && 'message-input-toolbar-uni',
    ]"
  >
    <div
      :class="[
        'message-input-toolbar-list',
        !isPC && 'message-input-toolbar-h5-list',
        isUniFrameWork && 'message-input-toolbar-uni-list',
      ]"
    >
      <EmojiPicker
        v-if="!isUniFrameWork"
        @insertEmoji="insertEmoji"
        @dialogShowInH5="dialogShowInH5"
        @dialogCloseInH5="dialogCloseInH5"
      />
      <ImageUpload
        v-if="isUniFrameWork"
        imageSourceType="camera"
      />
      <ImageUpload imageSourceType="album" />
      <FileUpload v-if="!isUniFrameWork" />
      <VideoUpload videoSourceType="album" />
      <VideoUpload
        v-if="isUniFrameWork"
        videoSourceType="camera"
      />
      <Evaluate />
      <Words />
      <template v-if="extensionListShowInStart[0]">
        <ToolbarItemContainer
          v-for="extension in extensionListShowInStart"
          :key="extension.id"
          :iconFile="genExtensionIcon(extension)"
          :title="genExtensionText(extension)"
          :iconWidth="isUniFrameWork ? '25px' : '20px'"
          :iconHeight="isUniFrameWork ? '25px' : '20px'"
          :needDialog="false"
          @onIconClick="onExtensionClick(extension)"
        />
      </template>
    </div>
    <div
      v-if="extensionListShowInEnd[0] && isPC"
      :class="['message-input-toolbar-list-end']"
    >
      <ToolbarItemContainer
        v-for="(extension, index) in extensionListShowInEnd"
        :key="index"
        :iconFile="genExtensionIcon(extension)"
        :title="genExtensionText(extension)"
        :iconWidth="isUniFrameWork ? '25px' : '20px'"
        :iconHeight="isUniFrameWork ? '25px' : '20px'"
        :needDialog="false"
        @onIconClick="onExtensionClick(extension)"
      />
    </div>
    <UserSelector
      ref="userSelectorRef"
      :type="selectorShowType"
      :currentConversation="currentConversation"
      :isGroup="isGroup"
      @submit="onUserSelectorSubmit"
      @cancel="onUserSelectorCancel"
    />
    <div
      v-if="isH5"
      ref="h5Dialog"
      :class="['message-input-toolbar-h5-dialog']"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onUnmounted } from '../../../adapter-vue';
import TUIChatEngine, {
  IConversationModel,
  TUIStore,
  StoreName,
} from '@tencentcloud/chat-uikit-engine';
import TUICore, { ExtensionInfo, TUIConstants } from '@tencentcloud/tui-core';
import EmojiPicker from './emoji-picker/index.vue';
import ImageUpload from './image-upload/index.vue';
import FileUpload from './file-upload/index.vue';
import VideoUpload from './video-upload/index.vue';
import Evaluate from './evaluate/index.vue';
import Words from './words/index.vue';
import ToolbarItemContainer from './toolbar-item-container/index.vue';
import UserSelector from './user-selector/index.vue';
import { isPC, isH5, isUniFrameWork } from '../../../utils/env';
import TUIChatConfig from '../config';
import { enableSampleTaskStatus } from '../../../utils/enableSampleTaskStatus';

const emits = defineEmits(['insertEmoji']);
const h5Dialog = ref();
const currentConversation = ref<IConversationModel>();
const isGroup = ref<boolean>(false);
const selectorShowType = ref<string>('');
const userSelectorRef = ref();
const currentUserSelectorExtension = ref<ExtensionInfo>();
const currentExtensionList = ref<ExtensionInfo[]>([]);

const getExtensionList = (conversationID: string) => {
  if (!conversationID) {
    return currentExtensionList.value = extensionList;
  }
  const chatType = TUIChatConfig.getChatType();
  const options: any = {
    chatType,
  };
  // 向下兼容，callkit 没有chatType 判断时，使用 filterVoice、filterVideo 过滤
  if (chatType === 'customerService') {
    options.filterVoice = true;
    options.filterVideo = true;
    enableSampleTaskStatus('customerService');
  }
  currentExtensionList.value = [
    ...TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID, options),
  ];
};

const onCurrentConversationUpdate = (conversation: IConversationModel) => {
  if (conversation?.conversationID && currentConversation.value?.conversationID !== conversation?.conversationID) {
    getExtensionList(conversation?.conversationID);
  }
  currentConversation.value = conversation;
  if (currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_GROUP) {
    isGroup.value = true;
  } else {
    isGroup.value = false;
  }
};

TUIStore.watch(StoreName.CONV, {
  currentConversation: onCurrentConversationUpdate,
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdate,
  });
});

// extensions
const extensionList: Array<ExtensionInfo> = [
  ...TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID),
];

// 按展示位置分类 extensionList （注意：仅 web 端 区分展示位置在 从 start 开始和 从 end 开始，在移动端不生效）
const extensionListShowInStart = computed(
  (): Array<ExtensionInfo> =>
    isPC ? currentExtensionList.value.filter((extension: ExtensionInfo) => extension?.data?.name !== 'search') : currentExtensionList.value,
);

const extensionListShowInEnd = computed<Array<ExtensionInfo>>(() => {
  if (isPC) {
    const searchExtension = currentExtensionList.value.find(extension => extension?.data?.name === 'search');
    return searchExtension ? [searchExtension] : [];
  }
  return [];
});

// handle extensions onclick
const onExtensionClick = (extension: ExtensionInfo) => {
  switch (extension?.data?.name) {
    case 'voiceCall':
      onCallExtensionClicked(extension, 1);
      break;
    case 'videoCall':
      onCallExtensionClicked(extension, 2);
      break;
    default:
      extension?.listener?.onClicked(currentConversation.value?._conversation);
      break;
  }
};

const onCallExtensionClicked = (extension: ExtensionInfo, callType: number) => {
  selectorShowType.value = extension?.data?.name;
  if (currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_C2C) {
    extension.listener?.onClicked?.({
      userIDList: [currentConversation?.value?.conversationID?.slice(3)],
      type: callType,
    });
  } else if (isGroup.value) {
    currentUserSelectorExtension.value = extension;
    userSelectorRef?.value?.toggleShow && userSelectorRef.value.toggleShow(true);
  }
};

const genExtensionIcon = (extension: any) => {
  return extension?.icon;
};

const genExtensionText = (extension: any) => {
  return extension?.text;
};

const onUserSelectorSubmit = (selectedInfo: any) => {
  currentUserSelectorExtension.value?.listener?.onClicked?.(selectedInfo);
  currentUserSelectorExtension.value = undefined;
};

const onUserSelectorCancel = () => {
  currentUserSelectorExtension.value = undefined;
};

const insertEmoji = (emojiObj: object) => {
  emits('insertEmoji', emojiObj);
};

const dialogShowInH5 = (dialogDom: any) => {
  if (!isH5) {
    return;
  }
  h5Dialog?.value?.appendChild && h5Dialog?.value?.appendChild(dialogDom);
};

const dialogCloseInH5 = (dialogDom: any) => {
  if (!isH5) {
    return;
  }
  h5Dialog?.value?.removeChild && h5Dialog?.value?.removeChild(dialogDom);
};
</script>
<style lang="scss" scoped>
@import "../../../assets/styles/common";

.message-input-toolbar {
  border-top: 1px solid #f4f5f9;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &-list {
    display: flex;
    flex-direction: row;
    align-items: center;

    .extension-list {
      list-style: none;
      display: flex;

      &-item {
        width: 20px;
        height: 20px;
        padding: 12px 10px 1px;
        cursor: pointer;
      }
    }
  }
}

.message-input-toolbar-h5 {
  padding: 5px 10px;
  box-sizing: border-box;
  flex-direction: column;
}

.message-input-toolbar-uni {
  background-color: #ebf0f6;
  flex-direction: column;

  &-list {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(2, 100px);
  }
}
</style>
