<template>
  <ToolbarItemContainer
    :iconFile="imageToolbarForShow.icon"
    :title="imageToolbarForShow.title"
    :iconWidth="isUniFrameWork ? '32px' : '20px'"
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
import TUIChatEngine, {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
  SendMessageOptions,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { ref, computed } from '../../../../adapter-vue';
import { isPC, isWeChat, isUniFrameWork } from '../../../../utils/env';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import imageIconLight from '../../../../assets/icon/image-light.svg';
import imageIconDark from '../../../../assets/icon/image-dark.svg';
import imageUniIcon from '../../../../assets/icon/image-uni.png';
import cameraUniIcon from '../../../../assets/icon/camera-uni.png';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../../offlinePushInfoManager/index';
import TUIChatConfig from '../../config';

const props = defineProps({
  // Image source: only valid for uni-app version, web version only supports selecting images from the album.
  // album: Select from album
  // camera: Take a photo using the camera
  imageSourceType: {
    type: String,
    default: 'album',
  },
});

const inputRef = ref();
const currentConversation = ref<IConversationModel>();
const theme = TUIChatConfig.getTheme();
const IMAGE_TOOLBAR_SHOW_MAP = {
  web_album: {
    icon: theme === 'dark' ? imageIconDark : imageIconLight,
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
  // uni-app send image
  if (isUniFrameWork) {
    if (isWeChat && TUIGlobal?.chooseMedia) {
      TUIGlobal?.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['original', 'compressed'],
        sourceType: [props.imageSourceType], // Use camera or select from album.
        success: function (res: any) {
          sendImageMessage(res);
        },
      });
    } else {
      // uni-app H5/App send image
      TUIGlobal?.chooseImage({
        count: 1,
        sourceType: [props.imageSourceType], // Use camera or select from album.
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
  const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
    conversation: currentConversation.value,
    payload: options.payload,
    messageType: TUIChatEngine.TYPES.MSG_IMAGE,
  };
  const sendMessageOptions: SendMessageOptions = {
    offlinePushInfo: OfflinePushInfoManager.create(offlinePushInfoCreateParams),
  };
  TUIChatService.sendImageMessage(options, sendMessageOptions);
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";
</style>
