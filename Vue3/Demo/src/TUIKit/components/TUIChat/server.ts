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
    // watch current conversationID
    TUIStore.watch(StoreName.CONV, {
      currentConversationID: (id: string) => {
        this.currentConversationID = id;
      },
    });
    // watch current conversation message list
    TUIStore.watch(StoreName.CHAT, {
      messageList: (list: IMessageModel[]) => {
        this.currentMessageList = list;
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
          const messageList = [...this.currentMessageList, message];
          TUIStore.update(StoreName.CHAT, 'messageList', messageList);
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
      default:
        break;
    }
  }
}
