import {
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

export const sendMessageErrorCodeMap: Map<number, string> = new Map([
  [3123, '文本包含本地审核拦截词'],
  [4004, '图片消息失败,无效的图片格式'],
  [4005, '文件消息失败,禁止发送违规封禁的文件'],
  [7004, '文件不存在,请检查文件路径是否正确'],
  [7005, '文件大小超出了限制,如果上传文件,最大限制是100MB'],
  [8001, '消息长度超出限制,消息长度不要超过12K'],
  [80001, '消息或者资料中文本存在敏感内容,发送失败'],
  [80004, '消息中图片存在敏感内容,发送失败'],
]);

/**
 * 该函数仅处理 Text TextAt Image Video File 五种消息类型
 * @param messageList
 * @param currentConversation
 */
export const sendMessages = async (
  messageList: ITipTapEditorContent[],
  currentConversation: IConversationModel,
) => {
  // 有 messageJumping 的情况下，发送消息自动清空，回到底部
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
      switch (content?.type) {
        case 'text':
          textMessageContent = JSON.parse(JSON.stringify(content?.payload?.text));
          // 禁止发送空消息
          if (!textMessageContent) {
            break;
          }
          if (content?.payload?.atUserList) {
            options.payload = {
              text: textMessageContent,
              atUserList: content?.payload?.atUserList,
            };
            await TUIChatService?.sendTextAtMessage(options);
          } else {
            options.payload = {
              text: textMessageContent,
            };
            await TUIChatService?.sendTextMessage(options);
          }
          break;
        case 'image':
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendImageMessage(options);
          break;
        case 'video':
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendVideoMessage(options);
          break;
        case 'file':
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendFileMessage(options);
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
      // 如果消息发送失败，且该消息为引用消息，清除引用消息信息
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
