import TUIChatEngine, { TUIChatService, IMessageModel, TUIUserService } from '@tencentcloud/chat-uikit-engine-lite';
import { sendMessageOptions } from './info';
import { breakAiRobotPayload, ChatbotBreakMsgType, ChatbotErrorMsgType, ChatbotPlugin } from './const';
import TUIChatConfig, { FeaturesType } from '../config';
import { JSONToObject } from '../../../utils';

class AiRobotManager {
  private name = 'aiRobotManager';
  private static instance: AiRobotManager | null = null;
  private aiRobots: Map<string, Record<string, any>> = new Map();
  private streamingMessages: Map<string, IMessageModel | undefined> = new Map();
  private streamingStatus: Map<string, boolean> = new Map();
  private streamingListener: (options: Record<string, boolean>) => void;

  private constructor() {
    this.aiRobots = new Map();
    this.streamingMessages = new Map();
    this.streamingStatus = new Map();
    this.streamingListener = () => {};
  }

  private getUserID = (conversationID: string) => {
    const type = conversationID.startsWith(TUIChatEngine.TYPES.CONV_C2C)
      ? TUIChatEngine.TYPES.CONV_C2C
      : TUIChatEngine.TYPES.CONV_GROUP;
    return conversationID.replace(type, '');
  };

  private getRobotInfo = async (conversationID: string) => {
    const userID = this.getUserID(conversationID);
    if (this.aiRobots.has(userID)) {
      return;
    }
    try {
      const res = await TUIUserService.getUserProfile({
        userIDList: [userID],
      });
      const { data } = res;
      this.aiRobots.set(userID, data[0]);
    } catch (error) {
      this.aiRobots.delete(userID);
    }
  };

  private genMsgKey = (message: IMessageModel) => {
    const { sequence, random, time } = message as any;
    return `${sequence}_${random}_${time}`;
  };

  private addThinkingMessage = (conversationID: string, messageList: IMessageModel[]) => {
    if (messageList.length === 0) {
      return messageList;
    }
    const lastMessage = messageList[messageList.length - 1];
    const isOutMessage = lastMessage.flow === 'out';
    const isBreakMessage = this.isBreakMessage(lastMessage);
    const currentTime = parseInt(`${Date.now() / 1000}`);
    const isOverTime = currentTime - lastMessage.time > 30;

    if (!isOutMessage || isBreakMessage || isOverTime) {
      return messageList;
    }

    const type: string = messageList[0].conversationType as string;
    const aiRobotID = conversationID.replace(type, '');

    const thinkingMessage = {
      ID: `thinking-${Date.now()}`,
      conversationID,
      from: aiRobotID,
      to: '',
      type: TUIChatEngine.TYPES.MSG_CUSTOM,
      conversationType: type,
      flow: 'in',
      avatar: this.aiRobots.get(aiRobotID)?.avatar || '',
      reactionList: [],
      readReceiptInfo: {},
      time: currentTime,
      payload: {
        data: JSON.stringify({
          chatbotPlugin: ChatbotPlugin,
          isThinking: true,
        }),
      },
      getMessageContent: () => ({
        showName: 'thinking',
      }),
    } as unknown as IMessageModel;
    messageList.push(thinkingMessage);
    return messageList;
  };

  public static getInstance(): AiRobotManager {
    if (!AiRobotManager.instance) {
      AiRobotManager.instance = new AiRobotManager();
    }
    return AiRobotManager.instance;
  }

  public initAiRobotChat = (conversationID: string) => {
    const showFeatures = [
      FeaturesType.CopyMessage,
      FeaturesType.DeleteMessage,
      FeaturesType.ForwardMessage,
    ];
    const hideFeatures = (Object.keys(FeaturesType) as FeaturesType[]).map((key) => {
      if (!showFeatures.includes(FeaturesType[key])) {
        return FeaturesType[key];
      }
    }) as FeaturesType[];
    TUIChatConfig.hideTUIChatFeatures(hideFeatures);
    TUIChatConfig.showTUIChatFeatures([FeaturesType.ClearHistory]);
    TUIChatConfig.setChatType('aiRobot');
    this.getRobotInfo(conversationID);
  };

  public isRobot = (conversationID: string) => {
    const userID = this.getUserID(conversationID);
    return userID.startsWith('@RBT#');
  };

  public isRobotMessage = (message?: IMessageModel) => {
    if (!message || !message.ID || !message.from) {
      return false;
    }
    const { type, payload } = message;
    const isCustomMessage = type === TUIChatEngine.TYPES.MSG_CUSTOM;
    if (isCustomMessage) {
      const data = JSONToObject(payload.data);
      return data.chatbotPlugin === ChatbotPlugin;
    }
    return false;
  };

  public isStreamingMessage = (message: IMessageModel) => {
    if (this.isRobotMessage(message)) {
      const payloadData = JSONToObject(message.payload.data);
      if (Object.keys(payloadData).includes('isFinished')) {
        return payloadData?.isFinished === 0 ? true : false;
      }
      return this.isThinkingMessage(message);
    }
    return false;
  };

  public onSteamingStatusChange = (callback: (options: Record<string, boolean>) => void) => {
    this.streamingListener = callback;
  };

  public isThinkingMessage = (message?: IMessageModel) => {
    const { payload } = message || {};
    if (this.isRobotMessage(message)) {
      const payloadData = JSONToObject(payload.data);
      return payloadData.isThinking;
    }
    return false;
  };

  private setSteamingStatus = (conversationID: string, status: boolean) => {
    if (status) {
      this.streamingStatus.set(conversationID, status);
    } else {
      this.streamingStatus.delete(conversationID);
    }
    const options: Record<string, boolean> = {};
    for (const [key, value] of this.streamingStatus) {
      options[key] = value;
    }
    this.streamingListener?.(options);
  };

  public handleMessageList = (messageList: IMessageModel[], conversationID: string) => {
    if (messageList.length === 0) {
      this.setSteamingStatus(conversationID, false);
      return messageList;
    }
    let list = messageList?.filter((message) => {
      return !this.isBreakMessage(message);
    });
    list = this.addThinkingMessage(conversationID, list);
    if (list.length > 0) {
      const lastMessage = list[list.length - 1];
      this.setSteamingStatus(conversationID, this.isStreamingMessage(lastMessage));
      const { payload, from } = lastMessage;
      if (this.isRobotMessage(lastMessage) && from.startsWith('@RBT#')) {
        const payloadData = JSONToObject(payload.data);
        const isFinished = payloadData.isFinished === 1 ? true : false;
        this.streamingMessages.set(conversationID, !isFinished ? lastMessage : undefined);
      }
    }
    return list;
  };

  public getRobotRenderText = (message: IMessageModel) => {
    const { payload, type } = message;
    const isCustomMessage = type === TUIChatEngine.TYPES.MSG_CUSTOM;
    if (!this.isRobotMessage(message) || !isCustomMessage) {
      return '';
    }
    const { text } = this.getRobotRenderContent(payload.data);
    return text;
  };

  public getRobotRenderContent = (data: string) => {
    const payloadData = JSONToObject(data);
    let renderText = '';
    if (payloadData.chunks) {
      const _chunks = payloadData.chunks;
      if (typeof _chunks === 'string' || Array.isArray(_chunks)) {
        renderText = Array.isArray(_chunks) ? _chunks.join('') : _chunks;
      }
    } else if (payloadData.content) {
      const _content = payloadData.content;
      if (typeof _content === 'string' || Array.isArray(_content)) {
        renderText = Array.isArray(_content) ? _content.join('') : _content;
      }
    } else if (payloadData.text) {
      renderText = payloadData.text;
    }
    return {
      text: renderText,
      payloadData,
    };
  };

  public isBreakMessage = (message: IMessageModel) => {
    const { payload } = message;
    if (this.isRobotMessage(message)) {
      const data = JSONToObject(payload.data);
      return data.src === ChatbotBreakMsgType;
    }
    return false;
  };

  public isErrorMessage = (message: IMessageModel) => {
    const { payload } = message;
    if (this.isRobotMessage(message)) {
      const data = JSONToObject(payload.data);
      return data.src === ChatbotErrorMsgType;
    }
    return false;
  };

  public sendBreakConversation = (conversationID: string) => {
    const message = this.streamingMessages.get(conversationID) as IMessageModel;
    this.sendBreakMessage(message);
  };

  public sendBreakMessage = (message: IMessageModel) => {
    if (this.isRobotMessage(message)) {
      breakAiRobotPayload.msgKey = this.genMsgKey(message);
      const data = JSON.stringify(breakAiRobotPayload);
      return TUIChatService.sendCustomMessage({
        to: message.from,
        payload: { data },
      }, sendMessageOptions);
    }
    return Promise.resolve();
  };
}

export default AiRobotManager;
