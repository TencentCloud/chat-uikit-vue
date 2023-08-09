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
      ></EmojiPicker>
      <ImageUpload v-if="isUniFrameWork" imageSourceType="camera"></ImageUpload>
      <ImageUpload imageSourceType="album"></ImageUpload>
      <FileUpload v-if="!isUniFrameWork"></FileUpload>
      <VideoUpload videoSourceType="album"></VideoUpload>
      <VideoUpload v-if="isUniFrameWork" videoSourceType="camera"></VideoUpload>
      <Evaluate></Evaluate>
      <Words></Words>
      <template v-if="extensionList[0]">
        <ToolbarItemContainer
          v-for="extension in extensionList"
          :iconFile="genExtensionIcon(extension)"
          :title="genExtensionText(extension)"
          :iconWidth="isUniFrameWork ? '25px' : '20px'"
          :iconHeight="isUniFrameWork ? '25px' : '20px'"
          :needDialog="false"
          @onIconClick="onExtensionClick(extension)"
        />
      </template>
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
      :class="['message-input-toolbar-h5-dialog']"
      ref="h5Dialog"
    ></div>
  </div>
</template>
<script setup lang="ts">
import TUIChatEngine, {
  TUIGlobal,
  IConversationModel,
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";
import TUICore, { ExtensionInfo, TUIConstants } from "@tencentcloud/tui-core";
import { ref, defineEmits } from "../../../adapter-vue";
// component
import EmojiPicker from "./emoji-picker/index.vue";
import ImageUpload from "./image-upload/index.vue";
import FileUpload from "./file-upload/index.vue";
import VideoUpload from "./video-upload/index.vue";
import Evaluate from "./evaluate/index.vue";
import Words from "./words/index.vue";
import ToolbarItemContainer from "./toolbar-item-container/index.vue";
import UserSelector from "./user-selector/index.vue";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";

const emits = defineEmits(["insertEmoji"]);

const h5Dialog = ref();
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isApp = ref(TUIGlobal.getPlatform() === "app");
const isUniFrameWork = ref(typeof uni !== "undefined");

const currentConversation = ref<typeof IConversationModel>();
const isGroup = ref<boolean>(false);
const selectorShowType = ref<string>("");
const userSelectorRef = ref();
const currentUserSelectorExtension = ref<typeof ExtensionInfo>();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: typeof IConversationModel) => {
    currentConversation.value = conversation;
    if (currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_GROUP) {
      isGroup.value = true;
    } else {
      isGroup.value = false;
    }
  },
});

// extensions
const extensionList: Array<typeof ExtensionInfo> = [
  ...TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID),
];

// handle extensions onclick
const onExtensionClick = (extension: typeof ExtensionInfo) => {
  switch (extension?.data?.name) {
    case "voiceCall":
      onCallExtensionClicked(extension, 1);
      break;
    case "videoCall":
      onCallExtensionClicked(extension, 2);
      break;
    default:
      break;
  }
};

const onCallExtensionClicked = (
  extension: typeof ExtensionInfo,
  callType: number
) => {
  selectorShowType.value = extension?.data?.name;
  if (currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_C2C) {
    extension?.listener?.onClicked({
      userIDList: [currentConversation?.value?.conversationID?.slice(3)],
      type: callType,
    });
  } else if (isGroup.value) {
    if (isUniFrameWork.value) {
      Toast({
        message: "暂不支持群通话",
        type: TOAST_TYPE.ERROR,
      });
    } else {
      currentUserSelectorExtension.value = extension;
      userSelectorRef?.value?.toggleShow &&
        userSelectorRef?.value?.toggleShow(true);
    }
  }
};

const genExtensionIcon = (extension: any) => {
  return extension?.icon;
};
const genExtensionText = (extension: any) => {
  return extension?.text;
};

const onUserSelectorSubmit = (selectedInfo: any) => {
  currentUserSelectorExtension.value?.listener?.onClicked(selectedInfo);
  currentUserSelectorExtension.value = null;
};

const onUserSelectorCancel = () => {
  currentUserSelectorExtension.value = null;
};

const insertEmoji = (emojiObj: object) => {
  emits("insertEmoji", emojiObj);
};

const dialogShowInH5 = (dialogDom: any) => {
  if (!isH5.value) {
    return;
  }
  h5Dialog?.value?.appendChild && h5Dialog?.value?.appendChild(dialogDom);
};

const dialogCloseInH5 = (dialogDom: any) => {
  if (!isH5.value) {
    return;
  }
  h5Dialog?.value?.removeChild && h5Dialog?.value?.removeChild(dialogDom);
};
</script>
<style lang="scss" scoped>
@import "../../../assets/styles/common.scss";
.message-input-toolbar {
  border-top: 1px solid #f4f5f9;
  height: fit-content;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  &-list {
    list-style: none;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
    &-item {
      .icon {
        margin: 12px 10px 1px;
        width: 20px;
        height: 20px;
      }
    }
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
  padding: 0 10px 10px 10px;
  box-sizing: border-box;
}

.message-input-toolbar-uni {
  background-color: #ebf0f6;
  &-list {
    display: grid;
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(2, 100px);
  }
}
</style>
