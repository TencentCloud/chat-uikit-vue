<template>
  <ToolbarItemContainer
    :iconFile="handleIcon()"
    :title="handleTitle()"
    :needDialog="false"
    :iconWidth="isUniFrameWork ? '32px' : '20px'"
    :iconHeight="isUniFrameWork
      ? props.videoSourceType === 'album'
        ? '20px'
        : '25px'
      : '18px'
    "
    @onIconClick="onIconClick"
  >
    <div :class="['video-upload', !isPC && 'video-upload-h5']">
      <input
        ref="inputRef"
        title="视频"
        type="file"
        data-type="video"
        accept="video/*"
        @change="sendVideoInWeb"
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
import { ref } from '../../../../adapter-vue';
import { isPC, isWeChat, isUniFrameWork } from '../../../../utils/env';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import videoIconLight from '../../../../assets/icon/video-light.svg';
import videoIconDark from '../../../../assets/icon/video-dark.svg';
import videoUniIcon from '../../../../assets/icon/video-uni.png';
import cameraUniIcon from '../../../../assets/icon/camera-uni.png';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../../offlinePushInfoManager/index';
import TUIChatConfig from '../../config';

const props = defineProps({
  // Video source, only valid for uni-app version, web version only supports selecting videos from files
  // album: Select from files
  // camera: Take a video using the camera
  videoSourceType: {
    type: String,
    default: 'album',
  },
});

const inputRef = ref();
const currentConversation = ref<IConversationModel>();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const handleIcon = (): string => {
  if (isUniFrameWork) {
    switch (props.videoSourceType) {
      case 'album':
        return videoUniIcon;
      case 'camera':
        return cameraUniIcon;
      default:
        return videoUniIcon;
    }
  } else {
    const videoIcon = TUIChatConfig.getTheme() === 'dark' ? videoIconDark : videoIconLight;
    return videoIcon;
  }
};

const handleTitle = (): string => {
  if (isUniFrameWork && props.videoSourceType === 'camera') {
    return '录制';
  } else {
    return '视频';
  }
};

const onIconClick = () => {
  // uni-app send video
  if (isUniFrameWork) {
    if (isWeChat && TUIGlobal?.chooseMedia) {
      TUIGlobal?.chooseMedia({
        mediaType: ['video'],
        count: 1,
        sourceType: [props.videoSourceType],
        maxDuration: 60,
        success: function (res: any) {
          sendVideoMessage(res);
        },
      });
    } else {
      TUIGlobal?.chooseVideo({
        count: 1,
        sourceType: [props.videoSourceType],
        compressed: false,
        success: function (res: any) {
          sendVideoMessage(res);
        },
      });
    }
  } else {
    inputRef?.value?.click && inputRef?.value?.click();
  }
};

const sendVideoInWeb = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  sendVideoMessage(e?.target);
  e.target.value = '';
};

const sendVideoMessage = (file: any) => {
  if (!file) {
    return;
  }
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID
      || currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
    conversation: currentConversation.value,
    payload: options.payload,
    messageType: TUIChatEngine.TYPES.MSG_VIDEO,
  };
  const sendMessageOptions: SendMessageOptions = {
    offlinePushInfo: OfflinePushInfoManager.create(offlinePushInfoCreateParams),
  };
  TUIChatService.sendVideoMessage(options, sendMessageOptions);
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";
</style>
