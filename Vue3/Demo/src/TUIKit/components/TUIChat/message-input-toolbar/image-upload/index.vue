<template>
  <ToolbarItemContainer
    :iconFile="imageToolbarForShow.icon"
    :title="imageToolbarForShow.title"
    :iconWidth="isUniFrameWork ? '32px' : '21px'"
    :iconHeight="isUniFrameWork ? '25px' : '18px'"
    :needDialog="false"
    @onIconClick="onIconClick"
  >
    <div
      v-if="!isUniFrameWork"
      :class="['image-upload', !isPC && 'image-upload-h5']"
    >
      <input
        ref="inputRef"
        title="图片"
        type="file"
        data-type="image"
        accept="image/gif,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
        @change="sendImageInWeb"
      >
    </div>
  </ToolbarItemContainer>
</template>
<script lang="ts" setup>
import {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { ref, computed } from '../../../../adapter-vue';
import { isPC, isWeChat, isUniFrameWork } from '../../../../utils/env';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import imageIcon from '../../../../assets/icon/image.png';
import imageUniIcon from '../../../../assets/icon/image-uni.png';
import cameraUniIcon from '../../../../assets/icon/camera-uni.png';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';

const props = defineProps({
  // 图片源, 仅uniapp版本有效, web版本仅支持从相册中选择图片
  // album: 从相册中选择
  // camera: 使用相机拍摄
  imageSourceType: {
    type: String,
    default: 'album',
  },
});

const inputRef = ref();
const currentConversation = ref<IConversationModel>();
const IMAGE_TOOLBAR_SHOW_MAP = {
  web_album: {
    icon: imageIcon,
    title: '图片',
  },
  uni_album: {
    icon: imageUniIcon,
    title: '图片',
  },
  uni_camera: {
    icon: cameraUniIcon,
    title: '拍照',
  },
};

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const imageToolbarForShow = computed((): { icon: string; title: string } => {
  if (isUniFrameWork) {
    return props.imageSourceType === 'camera'
      ? IMAGE_TOOLBAR_SHOW_MAP['uni_camera']
      : IMAGE_TOOLBAR_SHOW_MAP['uni_album'];
  } else {
    return IMAGE_TOOLBAR_SHOW_MAP['web_album'];
  }
});

const onIconClick = () => {
  // uniapp 环境 发送图片
  if (isUniFrameWork) {
    // 增加 TUIGlobal.chooseMedia 条件限制，防御 uni 打包其他平台小程序时由于打包问题导致 isWeChat 为 true 出现运行时报错
    if (isWeChat && TUIGlobal?.chooseMedia) {
      // 微信小程序从基础库 2.21.0 开始， wx.chooseImage 停止维护，请使用 uni.chooseMedia 代替
      TUIGlobal?.chooseMedia({
        count: 1,
        mediaType: ['image'], // 图片
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: [props.imageSourceType], // 从相册选择或使用相机拍摄
        success: function (res: any) {
          sendImageMessage(res);
        },
      });
    } else {
      // uniapp h5/app 发送图片
      TUIGlobal?.chooseImage({
        count: 1,
        sourceType: [props.imageSourceType], // 从相册选择或使用相机拍摄
        success: function (res) {
          sendImageMessage(res);
        },
      });
    }
  } else {
    if (inputRef.value?.click) {
      inputRef.value.click();
    }
  }
};

const sendImageInWeb = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  sendImageMessage(e?.target);
  e.target.value = '';
};

const sendImageMessage = (files: any) => {
  if (!files) {
    return;
  }
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID
      || currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file: files,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  // todo: 需要处理uniapp文件没有宽高的变形问题，需要linda看看
  TUIChatService.sendImageMessage(options);
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";
</style>
