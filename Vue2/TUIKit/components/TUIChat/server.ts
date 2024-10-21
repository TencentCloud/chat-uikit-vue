import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import {
  IMessageModel,
  TUIStore,
  StoreName,
  TUIChatService,
} from '@tencentcloud/chat-uikit-engine';
import TUIChatConfig from './config';

export default class TUIChatServer {
  public currentConversationID: string = '';
  public currentMessageList: IMessageModel[] = [];

  constructor() {
    // register service
    TUICore.registerService(TUIConstants.TUIChat.SERVICE.NAME, this);
    // register event
    TUICore.registerEvent(TUIConstants.TUITheme.EVENT.THEME_CHANGED, TUIConstants.TUITheme.EVENT_SUB_KEY.CHANGE_SUCCESS, this);
    TUICore.registerEvent(TUIConstants.TUIChat.EVENT.CHAT_TYPE_CHANGED, TUIConstants.TUIChat.EVENT_SUB_KEY.CHANGE_SUCCESS, this);
    // watch current conversationID
    TUIStore.watch(StoreName.CONV, {
      currentConversationID: (id: string) => {
        this.currentConversationID = id;
      },
    });
  }

  public onCall(method: string, params: any, callback: any): any {
    let message;
    switch (method) {
      case TUIConstants.TUIChat.SERVICE.METHOD.UPDATE_MESSAGE_LIST:
        message = params.message;
        // Two screen-up situations
        // 1. If the call message conversationID is currentConversation,
        // You need to use UPDATE_MESSAGE_LIST to update the messageList of TUIStore in the engine to display it on the screen
        // (because you cannot get the messages you sent at this time)
        // 2. If the call message conversationID is not currentConversation,
        // The next time you switch to the conversation where the call message is located, getMessageList can get all the call messages you sent
        // No need to process here
        if (message?.conversationID === this.currentConversationID) {
          TUIChatService.updateMessageList([message], 'push');
        }
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.SEND_CUSTOM_MESSAGE:
        TUIChatService.sendCustomMessage(params).then((res: any) => {
          callback && callback(res);
        });
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.SEND_TEXT_MESSAGE:
        TUIChatService.sendTextMessage(params).then((res: any) => {
          callback && callback(res);
        });
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.SET_CHAT_TYPE:
        TUIChatConfig.setChatType(params?.chatType);
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.CLOSE_MESSAGE_POP_MENU:
        TUIStore.update(StoreName.CUSTOM, 'isShowMessagePopMenu', false);
        break;
      case TUIConstants.TUIChat.SERVICE.METHOD.UPDATE_MESSAGE_INFO:
        TUIChatService.updateMessageInfo(params?.userInfo);
        break;
      default:
        break;
    }
  }

  /**
 * Listen for the success notification.
 */
  public onNotifyEvent(eventName: string, subKey: string, params?: Record<string, any>) {
    if (eventName === TUIConstants.TUITheme.EVENT.THEME_CHANGED) {
      switch (subKey) {
        case TUIConstants.TUITheme.EVENT_SUB_KEY.CHANGE_SUCCESS:
          if (params?.theme) {
            TUIChatConfig.setTheme(params.theme.toLowerCase()); // Room use 'DARK' or 'LIGHT'
          }
          break;
      }
    }
    if (eventName === TUIConstants.TUIChat.EVENT.CHAT_TYPE_CHANGED) {
      switch (subKey) {
        case TUIConstants.TUIChat.EVENT_SUB_KEY.CHANGE_SUCCESS:
          if (params?.chatType) {
            TUIChatConfig.setChatType(params?.chatType);
          }
          break;
      }
    }
  }
}
