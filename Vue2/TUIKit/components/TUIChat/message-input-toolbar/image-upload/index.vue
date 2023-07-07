<template>
  <ToolbarItemContainer
    :iconFile="handleIcon()"
    :title="handleTitle()"
    :iconWidth="isUniFrameWork ? '32px' : '21px'"
    :iconHeight="isUniFrameWork ? '25px' : '18px'"
    :needDialog="false"
    @onIconClick="onIconClick"
  >
    <div
      :class="['image-upload', !isPC && 'image-upload-h5']"
      v-if="!isUniFrameWork"
    >
      <input
        title="图片"
        type="file"
        data-type="image"
        accept="image/*"
        @change="sendImageInWeb"
        ref="inputRef"
      />
    </div>
  </ToolbarItemContainer>
</template>
<script lang="ts" setup>
import {
  TUIGlobal,
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
} from "@tencentcloud/chat-uikit-engine";
import { ref, defineEmits, defineProps } from "../../../../adapter-vue";

import ToolbarItemContainer from "../toolbar-item-container/index.vue";
import imageIcon from "../../../../assets/icon/image.png";
import imageUniIcon from "../../../../assets/icon/image-uni.png";
import cameraUniIcon from "../../../../assets/icon/camera-uni.png";

const props = defineProps({
  // 图片源, 仅uniapp版本有效, web版本仅支持从相册中选择图片
  // album: 从相册中选择
  // camera: 使用相机拍摄
  imageSourceType: {
    type: String,
    default: "album",
  },
});

const emits = defineEmits(["close"]);

const inputRef = ref();
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const currentConversation = ref<IConversationModel>();
const isUniFrameWork = ref(typeof uni !== 'undefined');
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");


TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const handleIcon = () => {
  if (isUniFrameWork.value) {
    switch (props.imageSourceType) {
      case "album":
        return imageUniIcon;
      case "camera":
        return cameraUniIcon;
    }
  } else {
    return imageIcon;
  }
};

const handleTitle = () => {
  if (isUniFrameWork.value) {
    switch (props.imageSourceType) {
      case "album":
        return "图片";
      case "camera":
        return "拍照";
    }
  } else {
    return "图片";
  }
};

const onIconClick = () => {
  // uniapp 环境 发送图片
  if (isUniFrameWork.value) {
    if (isWeChat.value) {
      // uniapp-小程序 发送图片，使用前请将 SDK 升级至v2.11.2或更高版本，将 tim-upload-plugin 升级至v1.0.2或更高版本
      // 微信小程序从基础库 2.21.0 开始， wx.chooseImage 停止维护，请使用 uni.chooseMedia 代替
      uni?.chooseMedia({
        count: 1,
        mediaType: ["image"], // 图片
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: [props.imageSourceType], // 从相册选择或使用相机拍摄
        success: function (res: any) {
          sendImageMessage(res);
        },
      });
    } else {
      // uniapp h5/app 发送图片
      uni?.chooseImage({
        count: 1,
        sourceType: [props.imageSourceType], // 从相册选择或使用相机拍摄
        success: function (res: any) {
          uni?.getImageInfo({
            src: res.tempFilePaths[0],
            success: function (image: any) {
              sendImageMessage(res, image.width, image.height);
            },
          });
        },
      });
    }
  } else {
    inputRef?.value?.click && inputRef?.value?.click();
  }
};

const sendImageInWeb = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  sendImageMessage(e?.target);
  e.target.value = '';
};

const sendImageMessage = (files: any, width?: string, height?: string) => {
  if (!files) {
    return;
  }
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID ||
      currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file: files,
    },
  } as SendMessageParams;
  // todo: 需要处理uniapp文件没有宽高的变形问题，需要linda看看
  TUIChatService.sendImageMessage(options);
};
</script>
<style lang="scss" scoped>
@import url(../../../../assets/styles/common.scss);
</style>
