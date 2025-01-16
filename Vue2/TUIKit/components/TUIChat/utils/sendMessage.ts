import TUIChatEngine, {
  TUIChatService,
  TUIStore,
  StoreName,
  TUITranslateService,
  IConversationModel,
  SendMessageParams,
} from '@tencentcloud/chat-uikit-engine';
import { Toast, TOAST_TYPE } from '../../common/Toast/index';
import { isEnabledMessageReadReceiptGlobal } from '../utils/utils';
import { ITipTapEditorContent } from '../../../interface';
import { enableSampleTaskStatus } from '../../../utils/enableSampleTaskStatus';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../offlinePushInfoManager/index';

export const sendMessageErrorCodeMap: Map<number, string> = new Map([
  [3123, '文本包含本地审核拦截词'],
  [4004, '图片消息失败,无效的图片格式'],
  [4005, '文件消息失败,禁止发送违规封禁的文件'],
  [7004, '文件不存在,请检查文件路径是否正确'],
  [7005, '文件大小超出了限制,如果上传文件,最大限制是100MB'],
  [8001, '消息长度超出限制,消息长度不要超过12K'],
  [80001, '消息或者资料中文本存在敏感内容,发送失败'],
  [80004, '消息中图片存在敏感内容,发送失败'],
  [10017, '您已被禁止聊天'],
]);

export const createOfflinePushInfo = (conversation: IConversationModel) => {
  const androidInfo = {};
  const apnsInfo = {};
  const userInfo = TUIStore.getData(StoreName.USER, 'userProfile');
  const entity = {
    sender: conversation.type === TUIChatEngine.TYPES.CONV_GROUP ? conversation.groupProfile?.groupID : userInfo.userID,
    nickName: userInfo.nick,
    chatType: conversation.type === TUIChatEngine.TYPES.CONV_GROUP ? 2 : 1,
    version: 1,
    action: 1,
  };
  return {
    extension: JSON.stringify({ entity }),
    androidInfo,
    apnsInfo,
  };
};

/**
 * This function only processes five message types: Text/TextAt/Image/Video/File
 * @param messageList
 * @param currentConversation
 */
export const sendMessages = async (
  messageList: ITipTapEditorContent[],
  currentConversation: IConversationModel,
) => {
  // In case of messageJumping, the sent message is automatically cleared and returns to the bottom
  if (TUIStore.getData(StoreName.CHAT, 'messageSource')) {
    TUIStore.update(StoreName.CHAT, 'messageSource', undefined);
  }
  messageList?.forEach(async (content: ITipTapEditorContent) => {
    try {
      const options: SendMessageParams = {
        to: currentConversation?.groupProfile?.groupID || currentConversation?.userProfile?.userID,
        conversationType: currentConversation?.type as any,
        payload: {},
        needReadReceipt: isEnabledMessageReadReceiptGlobal(),
      };
      // handle message typing
      let textMessageContent;
      const sendMessageOptions = {
        offlinePushInfo: {},
      };
      const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
        conversation: currentConversation,
        payload: content.payload,
        messageType: '',
      };
      switch (content?.type) {
        case 'text':
          textMessageContent = JSON.parse(JSON.stringify(content.payload?.text));
          // Do not send empty messages
          if (!textMessageContent) {
            break;
          }
          options.payload = {
            text: textMessageContent,
          };
          offlinePushInfoCreateParams.messageType = TUIChatEngine.TYPES.MSG_TEXT;
          sendMessageOptions.offlinePushInfo = OfflinePushInfoManager.create(offlinePushInfoCreateParams);
          if (content.payload?.atUserList) {
            options.payload.atUserList = content.payload.atUserList;
            await TUIChatService.sendTextAtMessage(options, sendMessageOptions);
          } else {
            await TUIChatService.sendTextMessage(options, sendMessageOptions);
          }
          break;
        case 'image':
          options.payload = {
            file: content.payload?.file,
          };
          offlinePushInfoCreateParams.messageType = TUIChatEngine.TYPES.MSG_IMAGE;
          sendMessageOptions.offlinePushInfo = OfflinePushInfoManager.create(offlinePushInfoCreateParams);
          await TUIChatService.sendImageMessage(options, sendMessageOptions);
          break;
        case 'video':
          options.payload = {
            file: content.payload?.file,
          };
          offlinePushInfoCreateParams.messageType = TUIChatEngine.TYPES.MSG_VIDEO;
          sendMessageOptions.offlinePushInfo = OfflinePushInfoManager.create(offlinePushInfoCreateParams);
          await TUIChatService.sendVideoMessage(options, sendMessageOptions);
          break;
        case 'file':
          options.payload = {
            file: content.payload?.file,
          };
          offlinePushInfoCreateParams.messageType = TUIChatEngine.TYPES.MSG_FILE;
          sendMessageOptions.offlinePushInfo = OfflinePushInfoManager.create(offlinePushInfoCreateParams);
          await TUIChatService.sendFileMessage(options, sendMessageOptions);
          break;
        default:
          break;
      }
      enableSampleTaskStatus('sendMessage');
    } catch (error: any) {
      Toast({
        message: sendMessageErrorCodeMap.get(error?.code)
          ? TUITranslateService.t(`TUIChat.${sendMessageErrorCodeMap.get(error.code) as string}`)
          : error?.message,
        type: TOAST_TYPE.ERROR,
      });
      // If the message fails to be sent and the message is a reference message, clear the reference message information
      if (TUIStore.getData(StoreName.CHAT, 'quoteMessage')) {
        TUIStore.update(StoreName.CHAT, 'quoteMessage', {});
      }
    }
  });
};

export const handleMessageWithTyping = (cloudCustomData: any) => {
  if (!cloudCustomData) {
    cloudCustomData = {};
  }
  cloudCustomData.messageFeature = {
    needTyping: 1,
    version: 1,
  };
  return cloudCustomData;
};

export const sendTyping = (inputContentEmpty: boolean, inputBlur: boolean) => {
  if (!inputContentEmpty && !inputBlur) {
    TUIChatService.enterTypingState();
  } else {
    TUIChatService.leaveTypingState();
  }
};
