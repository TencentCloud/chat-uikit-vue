import { isUniFrameWork } from '../../../utils/env';
import { TUIGlobal } from '@tencentcloud/universal-api';

interface IChatStorage {
  getChatStorage(key: string): any;
  setChatStorage(key: string, value: any): void;
}

class ChatStorage implements IChatStorage {
  private static instance: ChatStorage | null = null;
  private static CHAT_STORAGE_KEY: string = 'TUI_CHAT_STORAGE';

  private chatStorage: Record<string, any> | null = null;

  private constructor() {}

  public static getInstance(): ChatStorage {
    if (!ChatStorage.instance) {
      ChatStorage.instance = new ChatStorage();
    }
    return ChatStorage.instance;
  }

  public getChatStorage(key: string): any | undefined {
    if (!this.chatStorage) {
      this.chatStorage = this.getChatStorageFromLocalStorage();
    }
    if (key) {
      return this.chatStorage[key];
    } else {
      throw new Error('No key provided');
    }
  }

  public setChatStorage(key: string, value: any): void {
    if (!this.chatStorage) {
      this.chatStorage = this.getChatStorageFromLocalStorage();
    }
    this.chatStorage[key] = value;
    try {
      if (isUniFrameWork) {
        TUIGlobal.setStorageSync(ChatStorage.CHAT_STORAGE_KEY, JSON.stringify(this.chatStorage));
      } else {
        localStorage.setItem(ChatStorage.CHAT_STORAGE_KEY, JSON.stringify(this.chatStorage));
      }
    } catch (error) {
      throw new Error('Fail to set chat storage');
    }
  }

  private getChatStorageFromLocalStorage(): Record<string, any> {
    let chatStorageString: string = '';
    if (isUniFrameWork) {
      chatStorageString = TUIGlobal.getStorageSync(ChatStorage.CHAT_STORAGE_KEY) || '';
    } else {
      chatStorageString = localStorage.getItem(ChatStorage.CHAT_STORAGE_KEY) || '';
    }
    if (!chatStorageString) {
      return {};
    }
    try {
      this.chatStorage = JSON.parse(chatStorageString);
    } catch (error) {
      this.chatStorage = {};
    }
    return this.chatStorage as Record<string, any>;
  }
}

export default ChatStorage.getInstance();
