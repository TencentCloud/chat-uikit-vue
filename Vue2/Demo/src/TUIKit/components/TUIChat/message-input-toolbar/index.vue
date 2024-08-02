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
        v-if="isRenderedEmojiPicker"
        ref="emojiPickerRef"
        @insertEmoji="insertEmoji"
        @dialogShowInH5="dialogShowInH5"
        @dialogCloseInH5="dialogCloseInH5"
        @changeToolbarDisplayType="(type) => emits('changeToolbarDisplayType', type)"
      />
      <ImageUpload
        v-if="featureConfig.InputImage"
        imageSourceType="album"
      />
      <FileUpload v-if="featureConfig.InputFile" />
      <VideoUpload
        v-if="featureConfig.InputVideo"
        videoSourceType="album"
      />
      <Evaluate v-if="featureConfig.InputEvaluation" />
      <Words v-if="featureConfig.InputQuickReplies" />
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
import { ref, computed, onMounted, onUnmounted, watch } from '../../../adapter-vue';
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
import { ToolbarDisplayType } from '../../../interface';

interface IProps {
  displayType: ToolbarDisplayType;
}
interface IEmits {
  (e: 'scrollToLatestMessage'): void;
  (e: 'changeToolbarDisplayType', type: ToolbarDisplayType): void;
  (e: 'insertEmoji', emoji: any): void;
}
const props = withDefaults(defineProps<IProps>(), {
  displayType: 'none',
});

const emits = defineEmits<IEmits>();
const h5Dialog = ref<HTMLElement>();
const currentConversation = ref<IConversationModel>();
const isGroup = ref<boolean>(false);
const selectorShowType = ref<string>('');
const userSelectorRef = ref();
const emojiPickerRef = ref<InstanceType<typeof EmojiPicker>>();
const currentUserSelectorExtension = ref<ExtensionInfo>();
const currentExtensionList = ref<ExtensionInfo[]>([]);
const featureConfig = TUIChatConfig.getFeatureConfig();
const isRenderedEmojiPicker = ref<boolean>(true);
isRenderedEmojiPicker.value = featureConfig.InputEmoji || featureConfig.InputStickers;

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

watch(() => props.displayType, (newValue) => {
  if (newValue === 'none') {
    emojiPickerRef.value?.closeEmojiPicker();
  } else {
    emits('scrollToLatestMessage');
  }
});

const onCurrentConversationUpdate = (conversation: IConversationModel) => {
  if (conversation?.conversationID && conversation.conversationID !== currentConversation.value?.conversationID) {
    getExtensionList(conversation.conversationID);
  }
  currentConversation.value = conversation;
  isGroup.value = currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_GROUP;
};

const getExtensionList = (conversationID: string) => {
  if (!conversationID) {
    return;
  }
  const chatType = TUIChatConfig.getChatType();
  const params: Record<string, boolean | string> = { chatType };
  // Backward compatibility: When callkit does not have chatType judgment, use filterVoice and filterVideo to filter
  if (chatType === TUIConstants.TUIChat.TYPE.CUSTOMER_SERVICE) {
    params.filterVoice = true;
    params.filterVideo = true;
    enableSampleTaskStatus('customerService');
  }
  currentExtensionList.value = [
    ...TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID, params),
  ].filter((extension: ExtensionInfo) => {
    if (extension?.data?.name === 'search') {
      return featureConfig.MessageSearch;
    }
    return true;
  });
};

const extensionListShowInStart = computed<ExtensionInfo[]>(() => {
  if (isPC) {
    const extensionList = currentExtensionList.value.filter((extension: ExtensionInfo) => extension?.data?.name !== 'search');
    return extensionList;
  }
  return currentExtensionList.value;
});

const extensionListShowInEnd = computed<ExtensionInfo[]>(() => {
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
      (extension as any)?.listener?.onClicked(currentConversation.value?._conversation);
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
  h5Dialog.value?.appendChild && h5Dialog.value?.appendChild(dialogDom);
};

const dialogCloseInH5 = (dialogDom: any) => {
  if (!isH5) {
    return;
  }
  if (dialogDom) {
    h5Dialog.value?.removeChild && h5Dialog.value?.removeChild(dialogDom);
  }
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
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

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
