import { TUIChatService, TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";
import { ISendMessageParams, ITipTapEditorContent } from "../../../interface";
import { IConversationModel, SendMessageParams } from "@tencentcloud/chat-uikit-engine";

export const sendMessages = async (
  messageList: ITipTapEditorContent[],
  currentConversation: IConversationModel,
) => {
  // 有 messageJumping 的情况下，发送消息自动清空，回到底部
  if (TUIStore.getData(StoreName.CHAT, 'messageSource')) {
    TUIStore.update(StoreName.CHAT, "messageSource", undefined);
  }
  await messageList?.forEach(async (content: ITipTapEditorContent) => {
    try {
      const options: ISendMessageParams = {
        to: currentConversation?.groupProfile?.groupID || currentConversation?.userProfile?.userID,
        conversationType: currentConversation?.type,
        payload: {},
      };
      // handle message typing
      switch (content?.type) {
        case "text":
          // （此功能暂不支持）引用和回复只支持文本消息（对标微信）
          // replay or reference message
          // cloudCustomData = handleMessageReplyOrReference(cloudCustomData);
          // @ text message
          // 禁止发送空消息
          if (!JSON.parse(JSON.stringify(content?.payload?.text))) {
            break;
          }
          if (content?.payload?.atUserList) {
            options.payload = {
              text: JSON.parse(JSON.stringify(content?.payload?.text)),
              atUserList: content?.payload?.atUserList,
            };
            await TUIChatService?.sendTextAtMessage(options as SendMessageParams).catch(
              (err: any) => {
                Toast({
                  message: err?.message,
                  type: TOAST_TYPE.ERROR,
                });
              }
            );
          } else {
            options.payload = {
              text: JSON.parse(JSON.stringify(content?.payload?.text)),
            };
            await TUIChatService?.sendTextMessage(options as SendMessageParams).catch((err: any) => {
              Toast({
                message: err?.message,
                type: TOAST_TYPE.ERROR,
              });
            });
          }
          // 消息回复（此功能暂不支持）
          // if (replyOrReferenceObject?.show === "reply") {
          //   await TUIServer.replyMessage(res?.data?.message);
          // }
          break;
        case "image":
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendImageMessage(options as SendMessageParams).catch((err: any) => {
            Toast({
              message: err?.message,
              type: TOAST_TYPE.ERROR,
            });
          });
          break;
        case "video":
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendVideoMessage(options as SendMessageParams).catch((err: any) => {
            Toast({
              message: err?.message,
              type: TOAST_TYPE.ERROR,
            });
          });
          break;
        case "file":
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendFileMessage(options as SendMessageParams).catch((err: any) => {
            Toast({
              message: err.message,
              type: TOAST_TYPE.ERROR,
            });
          });
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.warn("messageInput sendMessage", error);
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
