import {
  IMessageModel,
  TUIChatService,
  TUIStore,
} from '@tencentcloud/chat-uikit-engine';
import { IChatResponese } from '../../../interface';

class Convertor {
  public isUseCache = true;
  private convertCache = new Map<string, string>();
  private static instance: Convertor | undefined = undefined;

  private constructor() {}

  static getInstance() {
    if (!Convertor.instance) {
      Convertor.instance = new Convertor();
    }
    return Convertor.instance;
  }

  async get(message: IMessageModel): Promise<string> {
    // step1: check in cache if convert result exist
    if (this.isUseCache) {
      const cache = this.convertCache.get(message.ID);
      if (cache !== undefined) {
        return cache;
      }
    }

    // step2: get message model with prototype methods
    const currentMessage: IMessageModel = TUIStore.getMessageModel(message.ID);
    if (!currentMessage) {
      return Promise.reject('message not found');
    }
    // step3: get response from api
    const response: IChatResponese<{ result: string }> = await TUIChatService.convertVoiceToText({
      message: currentMessage,
    });
    let { data: { result } = {} } = response;
    if (result) {
      this.convertCache.set(currentMessage.ID, result);
    } else {
      result = '';
    }
    return result;
  }

  clear() {
    this.convertCache.clear();
  }

  disableCache() {
    this.isUseCache = false;
  }

  enableCache() {
    this.isUseCache = true;
  }
}

export const convertor = Convertor.getInstance();
