import { ref, computed } from '../../../../adapter-vue';
import { TUIStore, StoreName, IConversationModel } from '@tencentcloud/chat-uikit-engine-lite';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { isPC, isUniFrameWork } from '../../../../utils/env';
import TUIChatConfig from '../../config';
import {
  TOOLBAR_DISPLAY_CONFIG,
  ICON_SIZE_CONFIG,
  MEDIA_CHOOSE_CONFIG,
  UploadType,
  SourceType,
  MediaType,
  PlatformType,
} from './constants';
import {
  sendImageMessage,
  sendVideoMessage,
  sendFileMessage,
  handleWebFileSelect,
} from './utils';

export function genSourceType(uploadType: UploadType): SourceType {
  if (uploadType === UploadType.CAMERA) {
    return SourceType.CAMERA;
  }
  return SourceType.ALBUM;
}

export function useUpload(uploadType: UploadType) {
  const inputRef = ref();
  const currentConversation = ref<IConversationModel>();
  const theme = TUIChatConfig.getTheme();

  TUIStore.watch(StoreName.CONV, {
    currentConversation: (conversation: IConversationModel) => {
      currentConversation.value = conversation;
    },
  });

  const sourceType = genSourceType(uploadType);

  const toolbarConfig = computed(() => {
    const config = TOOLBAR_DISPLAY_CONFIG[uploadType];

    if (isUniFrameWork) {
      const displayConfig = (config as any)[PlatformType.UNI];

      return {
        icon: displayConfig.icon,
        title: displayConfig.title,
        iconWidth: ICON_SIZE_CONFIG.UNI.WIDTH,
        iconHeight: ICON_SIZE_CONFIG.UNI.HEIGHT,
      };
    } else {
      const displayConfig = (config as any)[PlatformType.WEB];

      return {
        icon: displayConfig.getIcon ? displayConfig.getIcon(theme) : displayConfig.icon,
        title: displayConfig.title,
        iconWidth: ICON_SIZE_CONFIG.WEB.WIDTH,
        iconHeight: ICON_SIZE_CONFIG.WEB.HEIGHT,
      };
    }
  });

  const handleIconClick = () => {
    if (isUniFrameWork) {
      handleUniAppClick();
    } else {
      handleWebClick();
    }
  };

  const handleUniAppClick = () => {
    switch (uploadType) {
      case UploadType.IMAGE:
        chooseImageInUniApp();
        break;
      case UploadType.VIDEO:
        chooseVideoInUniApp();
        break;
      case UploadType.ALBUM:
        chooseMediaInUniApp();
        break;
      case UploadType.CAMERA:
        chooseCameraInUniApp();
        break;
      default:
        break;
    }
  };

  const handleWebClick = () => {
    if (inputRef.value?.click) {
      inputRef.value.click();
    }
  };

  const chooseImageInUniApp = () => {
    if (TUIGlobal?.chooseMedia) {
      TUIGlobal.chooseMedia({
        count: MEDIA_CHOOSE_CONFIG.IMAGE.COUNT,
        mediaType: MEDIA_CHOOSE_CONFIG.IMAGE.MEDIA_TYPE,
        sizeType: MEDIA_CHOOSE_CONFIG.IMAGE.SIZE_TYPE,
        sourceType: [sourceType],
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            sendImageMessage(currentConversation.value, res);
          }
        },
      });
    } else {
      TUIGlobal?.chooseImage({
        count: MEDIA_CHOOSE_CONFIG.IMAGE.COUNT,
        sourceType: [sourceType],
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            sendImageMessage(currentConversation.value, res);
          }
        },
      });
    }
  };

  const chooseVideoInUniApp = () => {
    if (TUIGlobal?.chooseMedia) {
      TUIGlobal.chooseMedia({
        mediaType: MEDIA_CHOOSE_CONFIG.VIDEO.MEDIA_TYPE,
        count: MEDIA_CHOOSE_CONFIG.VIDEO.COUNT,
        sourceType: [sourceType],
        maxDuration: MEDIA_CHOOSE_CONFIG.VIDEO.MAX_DURATION,
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            sendVideoMessage(currentConversation.value, res);
          }
        },
      });
    } else {
      TUIGlobal?.chooseVideo({
        count: MEDIA_CHOOSE_CONFIG.VIDEO.COUNT,
        sourceType: [sourceType],
        compressed: MEDIA_CHOOSE_CONFIG.VIDEO.COMPRESSED,
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            sendVideoMessage(currentConversation.value, res);
          }
        },
      });
    }
  };

  const chooseMediaInUniApp = () => {
    if (TUIGlobal?.chooseMedia) {
      TUIGlobal.chooseMedia({
        count: MEDIA_CHOOSE_CONFIG.MIXED.COUNT,
        mediaType: MEDIA_CHOOSE_CONFIG.MIXED.MEDIA_TYPE,
        sizeType: MEDIA_CHOOSE_CONFIG.MIXED.SIZE_TYPE,
        sourceType: [sourceType],
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            if (res?.type === MediaType.IMAGE) {
              sendImageMessage(currentConversation.value, res);
            } else if (res?.type === MediaType.VIDEO) {
              sendVideoMessage(currentConversation.value, res);
            }
          }
        },
      });
    } else {
      TUIGlobal?.chooseImage({
        count: MEDIA_CHOOSE_CONFIG.IMAGE.COUNT,
        sourceType: [sourceType],
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            sendImageMessage(currentConversation.value, res);
          }
        },
      });
    }
  };

  const chooseCameraInUniApp = () => {
    if (TUIGlobal?.chooseMedia) {
      TUIGlobal.chooseMedia({
        count: MEDIA_CHOOSE_CONFIG.MIXED.COUNT,
        mediaType: MEDIA_CHOOSE_CONFIG.MIXED.MEDIA_TYPE,
        sizeType: MEDIA_CHOOSE_CONFIG.MIXED.SIZE_TYPE,
        sourceType: [sourceType],
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            if (res?.type === MediaType.IMAGE) {
              sendImageMessage(currentConversation.value, res);
            } else if (res?.type === MediaType.VIDEO) {
              sendVideoMessage(currentConversation.value, res);
            }
          }
        },
      });
    } else {
      TUIGlobal?.chooseVideo({
        count: MEDIA_CHOOSE_CONFIG.VIDEO.COUNT,
        sourceType: [sourceType],
        compressed: MEDIA_CHOOSE_CONFIG.VIDEO.COMPRESSED,
        success: function (res: Record<string, any>) {
          if (currentConversation.value) {
            sendVideoMessage(currentConversation.value, res);
          }
        },
      });
    }
  };

  const handleWebFileChange = (event: Event) => {
    switch (uploadType) {
      case UploadType.IMAGE:
        handleWebFileSelect(event, (file) => {
          if (currentConversation.value) {
            sendImageMessage(currentConversation.value, file);
          }
        });
        break;
      case UploadType.VIDEO:
        handleWebFileSelect(event, (file) => {
          if (currentConversation.value) {
            sendVideoMessage(currentConversation.value, file);
          }
        });
        break;
      case UploadType.FILE:
        handleWebFileSelect(event, (file) => {
          if (currentConversation.value) {
            sendFileMessage(currentConversation.value, file);
          }
        });
        break;
    }
  };

  return {
    inputRef,
    currentConversation,
    toolbarConfig,
    isPC,
    isUniFrameWork,
    handleIconClick,
    handleWebFileChange,
  };
}
