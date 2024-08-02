import TUIChatEngine, { IConversationModel, StoreName, TUIStore, TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { transformTextWithKeysToEmojiNames } from '../emoji-config';
import {
  IChatOfflinePushInfo,
  IOfflinePushInfoCreateParams,
} from './interface';
import { chatOfflinePushInfo, callOfflinePushInfo } from './info';
import { DEFAULT_DESC, PUSH_SCENE } from './const';

class OfflinePushInfoManager {
  private name = 'OfflinePushInfoManager';
  private static instance: OfflinePushInfoManager | null = null;

  private offlinePushInfo: any = {};

  private constructor() {
    this.offlinePushInfo = {
      [PUSH_SCENE.CHAT]: chatOfflinePushInfo,
      [PUSH_SCENE.CALL]: callOfflinePushInfo,
    };
  }

  public static getInstance(): OfflinePushInfoManager {
    if (!OfflinePushInfoManager.instance) {
      OfflinePushInfoManager.instance = new OfflinePushInfoManager();
    }
    return OfflinePushInfoManager.instance;
  }

  public getOfflinePushInfo(scene: PUSH_SCENE) {
    if (!Object.values(PUSH_SCENE).includes(scene)) {
      console.error(`${this.name} getOfflinePushInfo scene: ${scene} is invalid`);
      return null;
    }
    return this.offlinePushInfo[scene];
  }

  private genTitle(conversation: IConversationModel, userInfo: any) {
    let title = conversation?.getShowName();
    if (conversation.type === TUIChatEngine.TYPES.CONV_C2C) {
      title = userInfo?.nick || userInfo?.userID;
    }
    return title;
  }

  private genDesc(messageType: string, payload: any) {
    let desc = '';
    if (messageType === TUIChatEngine.TYPES.MSG_TEXT) {
      desc = transformTextWithKeysToEmojiNames(payload.text);
    }
    if (messageType === TUIChatEngine.TYPES.MSG_CUSTOM) {
      desc = payload.description;
    }
    return desc || TUITranslateService.t(`TUIChat.${DEFAULT_DESC[messageType]}`);
  }

  public create(options: IOfflinePushInfoCreateParams): IChatOfflinePushInfo {
    const { conversation, messageType = '', payload = {} } = options || {};
    const userInfo = TUIStore.getData(StoreName.USER, 'userProfile');
    const entity = {
      sender: conversation.type === TUIChatEngine.TYPES.CONV_GROUP ? conversation.groupProfile?.groupID : userInfo?.userID,
      nickName: userInfo?.nick,
      chatType: conversation.type === TUIChatEngine.TYPES.CONV_GROUP ? 2 : 1,
      version: 1,
      action: 1,
    };
    return {
      title: this.genTitle(conversation, userInfo),
      description: this.genDesc(messageType, payload),
      extension: JSON.stringify({ entity }),
      ...this.offlinePushInfo[PUSH_SCENE.CHAT],
    };
  }
}

export default OfflinePushInfoManager;
